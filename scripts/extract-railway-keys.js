import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const varsPath = path.join(__dirname, '../railway_vars_platform.json');
const envPath = path.join(__dirname, '../.env');

try {
    // Read raw buffer to handle potential encoding weirdness from PowerShell
    const rawBuffer = fs.readFileSync(varsPath);
    let content = rawBuffer.toString('utf8');

    // Quick heuristic to detect UTF-16LE (BOM or null bytes)
    // PowerShell redirection often produces UTF-16LE
    if (content.indexOf('\u0000') !== -1 || rawBuffer[0] === 0xFF && rawBuffer[1] === 0xFE) {
        content = rawBuffer.toString('utf16le');
    }

    // Clean up potential BOM (Byte Order Mark)
    content = content.replace(/^\uFEFF/, '');

    // Sometimes there is garbage at the end or beginning, try to find the JSON object
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
        content = content.substring(firstBrace, lastBrace + 1);
    }

    console.log("Parsing content length:", content.length);

    const vars = JSON.parse(content);

    // Find keys
    const dbUrl = vars.DATABASE_URL;
    const sesEmail = vars.SES_VERIFIED_EMAIL;

    if (!dbUrl) {
        console.error("❌ DATABASE_URL not found in Railway variables!");
        // Log keys found to help debug
        console.log("Available keys:", Object.keys(vars));
        process.exit(1);
    }

    console.log(`✅ Found DATABASE_URL`);
    if (sesEmail) console.log(`✅ Found SES_VERIFIED_EMAIL: ${sesEmail}`);
    else console.warn(`⚠️ SES_VERIFIED_EMAIL not found.`);

    // Read .env
    let envContent = "";
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or Append
    // We simple append/replace logic
    const lines = envContent.split('\n');
    const newLines = [];
    const keysFound = { db: false, ses: false };

    for (const line of lines) {
        if (line.startsWith('DATABASE_URL=')) {
            newLines.push(`DATABASE_URL="${dbUrl}"`);
            keysFound.db = true;
        } else if (line.startsWith('SES_VERIFIED_EMAIL=')) {
            if (sesEmail) {
                newLines.push(`SES_VERIFIED_EMAIL="${sesEmail}"`);
                keysFound.ses = true;
            } else {
                newLines.push(line);
            }
        } else {
            newLines.push(line);
        }
    }

    if (!keysFound.db) newLines.push(`DATABASE_URL="${dbUrl}"`);
    if (sesEmail && !keysFound.ses) newLines.push(`SES_VERIFIED_EMAIL="${sesEmail}"`);

    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log("✅ .env updated successfully.");

} catch (e) {
    console.error("Failed to extract keys:", e);
    process.exit(1);
}
