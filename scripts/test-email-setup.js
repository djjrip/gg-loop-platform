/**
 * Test Email Setup
 * Verifies Gmail credentials work before running automation
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
    console.log('\n🧪 Testing email configuration...\n');

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
        console.log('❌ Missing credentials in .env file');
        console.log('   EMAIL_USER:', user ? '✅' : '❌');
        console.log('   EMAIL_APP_PASSWORD:', pass ? '✅' : '❌');
        process.exit(1);
    }

    console.log('   Email:', user);
    console.log('   Password:', '****' + pass.slice(-4));
    console.log('\n   Connecting to Gmail SMTP...\n');

    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: { user, pass }
    });

    try {
        await transporter.verify();
        console.log('✅ Connection successful!\n');
        console.log('   Sending test email to yourself...\n');

        await transporter.sendMail({
            from: user,
            to: user,
            subject: '✅ GG Loop Auto-Revenue System - Test Email',
            text: 'Your autonomous revenue system is configured correctly!\n\n' +
                'Cold email automation is ready to run.\n\n' +
                'Check data/prospects.json to add targets, then run:\n' +
                'RUN-AUTO-REVENUE.bat\n\n' +
                '- GG Loop Automation'
        });

        console.log('✅ Test email sent!\n');
        console.log('   Check your inbox for confirmation.\n');
        console.log('🎉 Setup complete! Ready to run automation.\n');
        process.exit(0);

    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('\n   Possible issues:');
        console.log('   - Wrong app password');
        console.log('   - 2FA not enabled on Google Account');
        console.log('   - App password not created');
        console.log('\n   Fix: https://myaccount.google.com/apppasswords\n');
        process.exit(1);
    }
}

testEmail();
