const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.resolve(__dirname, '../.env');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n🔐 GG LOOP SECURE CREDENTIAL INPUT 🔐");
console.log("=========================================");
console.log("This script will securely add your production credentials to .env");
console.log("Your inputs will NOT be logged or saved anywhere else.\n");

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    try {
        let envContent = "";
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // 1. DATABASE_URL
        console.log("👉 Step 1: Production Database");
        console.log("   Please paste your Railway PostgreSQL Connection URL.");
        console.log("   (Format: postgresql://postgres:password@host:port/railway)");
        const dbUrl = await askQuestion("   DATABASE_URL: ");

        if (dbUrl && dbUrl.trim().length > 10) {
            if (!envContent.includes("DATABASE_URL=")) {
                fs.appendFileSync(envPath, `\nDATABASE_URL="${dbUrl.trim()}"\n`);
                console.log("   ✅ DATABASE_URL added.");
            } else {
                // Simple replace or append warning
                console.log("   ⚠️ DATABASE_URL already exists. Appending overwrite...");
                fs.appendFileSync(envPath, `\n# Overwritten by Setup Script\nDATABASE_URL="${dbUrl.trim()}"\n`);
            }
        } else {
            console.log("   ⚠️ Skipping DATABASE_URL (Input empty or too short)");
        }

        console.log("\n-----------------------------------------\n");

        // 2. SES_VERIFIED_EMAIL
        console.log("👉 Step 2: AWS SES Verified Email");
        console.log("   Enter the email address verified in AWS SES Console.");
        const sesEmail = await askQuestion("   SES_VERIFIED_EMAIL: ");

        if (sesEmail && sesEmail.includes("@")) {
            if (!envContent.includes("SES_VERIFIED_EMAIL=")) {
                fs.appendFileSync(envPath, `\nSES_VERIFIED_EMAIL="${sesEmail.trim()}"\n`);
                console.log("   ✅ SES_VERIFIED_EMAIL added.");
            } else {
                console.log("   ⚠️ SES_VERIFIED_EMAIL already exists. Appending overwrite...");
                fs.appendFileSync(envPath, `\nSES_VERIFIED_EMAIL="${sesEmail.trim()}"\n`);
            }
        } else {
            console.log("   ⚠️ Skipping SES_VERIFIED_EMAIL (Invalid format)");
        }

        console.log("\n-----------------------------------------\n");

        // 3. AWS_ACCESS_KEY_ID
        console.log("👉 Step 3: AWS Access Key ID");
        console.log("   Enter your AWS IAM Access Key ID from AWS Console.");
        const awsAccessKey = await askQuestion("   AWS_ACCESS_KEY_ID: ");

        if (awsAccessKey && awsAccessKey.trim().length > 10) {
            if (!envContent.includes("AWS_ACCESS_KEY_ID=")) {
                fs.appendFileSync(envPath, `\nAWS_ACCESS_KEY_ID="${awsAccessKey.trim()}"\n`);
                console.log("   ✅ AWS_ACCESS_KEY_ID added.");
            } else {
                console.log("   ⚠️ AWS_ACCESS_KEY_ID already exists. Appending overwrite...");
                fs.appendFileSync(envPath, `\nAWS_ACCESS_KEY_ID="${awsAccessKey.trim()}"\n`);
            }
        } else {
            console.log("   ⚠️ Skipping AWS_ACCESS_KEY_ID (Input empty or too short)");
        }

        console.log("\n-----------------------------------------\n");

        // 4. AWS_SECRET_ACCESS_KEY
        console.log("👉 Step 4: AWS Secret Access Key");
        console.log("   Enter your AWS IAM Secret Access Key from AWS Console.");
        const awsSecretKey = await askQuestion("   AWS_SECRET_ACCESS_KEY: ");

        if (awsSecretKey && awsSecretKey.trim().length > 10) {
            if (!envContent.includes("AWS_SECRET_ACCESS_KEY=")) {
                fs.appendFileSync(envPath, `\nAWS_SECRET_ACCESS_KEY="${awsSecretKey.trim()}"\n`);
                console.log("   ✅ AWS_SECRET_ACCESS_KEY added.");
            } else {
                console.log("   ⚠️ AWS_SECRET_ACCESS_KEY already exists. Appending overwrite...");
                fs.appendFileSync(envPath, `\nAWS_SECRET_ACCESS_KEY="${awsSecretKey.trim()}"\n`);
            }
        } else {
            console.log("   ⚠️ Skipping AWS_SECRET_ACCESS_KEY (Input empty or too short)");
        }

        console.log("\n=========================================");
        console.log("✅ SETUP COMPLETE. You can now run the autonomous agent.");
        console.log("=========================================\n");

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        rl.close();
    }
}

main();
