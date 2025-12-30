const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');

try {
    if (!fs.existsSync(envPath)) {
        console.log("MISSING_FILE");
        process.exit(0);
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const missing = [];

    // Check DATABASE_URL
    if (!content.includes('DATABASE_URL=') || content.includes('DATABASE_URL=""') || content.includes("DATABASE_URL=''")) {
        missing.push('DATABASE_URL');
    } else {
        // Basic format check
        const match = content.match(/DATABASE_URL=["']?(.*?)["']?(\r|\n|$)/);
        if (match && match[1] && match[1].startsWith('postgres')) {
            // ok
        } else {
            missing.push('DATABASE_URL (Invalid Format)');
        }
    }

    // Check SES_VERIFIED_EMAIL
    if (!content.includes('SES_VERIFIED_EMAIL=')) {
        missing.push('SES_VERIFIED_EMAIL');
    }

    if (missing.length > 0) {
        console.log("MISSING:", missing.join(', '));
    } else {
        console.log("READY");
    }

} catch (e) {
    console.error("ERROR", e);
}
