#!/usr/bin/env node

/**
 * SOCIAL PROOF GENERATOR
 * Auto-creates sharable screenshots of milestones
 * Innovation: Visual proof > text claims
 */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

async function generateMilestoneCard(type, data) {
    const canvas = createCanvas(1200, 630); // Twitter card size
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Accent gradient
    const accentGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    accentGradient.addColorStop(0, '#ff7a28');
    accentGradient.addColorStop(1, '#d4a574');
    ctx.strokeStyle = accentGradient;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1160, 590);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';

    const titles = {
        firstSignup: 'FIRST USER',
        firstDownload: 'FIRST DOWNLOAD',
        firstGamePlayed: 'FIRST GAME TRACKED',
        firstRedemption: 'FIRST REDEMPTION',
        first10Users: '10 USERS',
        first100Users: '100 USERS'
    };

    ctx.fillText(titles[type] || type.toUpperCase(), 600, 180);

    // Icon (text emoji for now, can upgrade to images)
    ctx.font = '120px Arial';
    const icons = {
        firstSignup: '🎮',
        firstDownload: '⬇️',
        firstGamePlayed: '⚡',
        firstRedemption: '🎁',
        first10Users: '🎯',
        first100Users: '🚀'
    };
    ctx.fillText(icons[type] || '✨', 600, 340);

    // Timestamp
    ctx.font = '32px Arial';
    ctx.fillStyle = '#d4a574';
    const date = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    ctx.fillText(date, 600, 440);

    // Footer
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GG LOOP', 600, 540);

    // Save
    const buffer = canvas.toBuffer('image/png');
    const dir = './social-proof';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `${dir}/${type}-${Date.now()}.png`;
    fs.writeFileSync(filename, buffer);

    console.log(`✅ Generated social proof card: ${filename}`);
    return filename;
}

export { generateMilestoneCard };

// Note: Requires 'canvas' npm package
// For now, this is a template - will work once canvas is installed
// Alternative: Use HTML/Puppeteer for screenshot generation
