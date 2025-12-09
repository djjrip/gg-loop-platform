/**
 * Twitter Meme Bot with Image Posting
 * Posts gaming memes automatically
 * 
 * Engagement boost: 3-5x vs text-only
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const TWITTER_API_KEY = process.env.TWITTER_API_KEY || '';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || '';
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || '';
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET || '';
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';

/**
 * Upload image to Twitter
 */
async function uploadImage(imagePath: string): Promise<string> {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            media_data: base64Image,
        }),
    });

    const data: any = await response.json();
    return data.media_id_string;
}

/**
 * Post tweet with image
 */
export async function postMeme(text: string, imagePath: string) {
    try {
        // Upload image first
        const mediaId = await uploadImage(imagePath);

        // Post tweet with image
        const response = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                media: {
                    media_ids: [mediaId],
                },
            }),
        });

        const data: any = await response.json();
        console.log('✅ Posted meme:', text.substring(0, 50));
        return data;
    } catch (error) {
        console.error('❌ Meme post error:', error);
        throw error;
    }
}

/**
 * Gaming meme templates
 */
const MEME_LIBRARY = [
    {
        image: 'memes/drake_meme.jpg',
        top: 'Grinding ranked for nothing',
        bottom: 'Grinding ranked and getting paid',
        caption: 'Every gamer after finding GG LOOP\\n\\nggloop.io\\n\\n#gaming #memes',
    },
    {
        image: 'memes/distracted_boyfriend.jpg',
        caption: 'Me: Regular gaming\\n\\nGG LOOP: Gaming + rewards\\n\\nMy wallet: 👀\\n\\nggloop.io\\n\\n#gaming #memes',
    },
    {
        image: 'memes/is_this.jpg',
        caption: 'Gaming platforms: Is this... exploitation?\\n\\nGG LOOP: No, this is fair rewards.\\n\\nggloop.io\\n\\n#gaming #FilipinoPride',
    },
];

/**
 * Auto-post random meme
 */
export async function postRandomMeme() {
    const meme = MEME_LIBRARY[Math.floor(Math.random() * MEME_LIBRARY.length)];
    const imagePath = path.join(__dirname, '..', meme.image);

    return await postMeme(meme.caption, imagePath);
}

/**
 * Generate meme using Imgflip API (free)
 */
export async function generateMeme(templateId: string, topText: string, bottomText: string) {
    const response = await fetch('https://api.imgflip.com/caption_image', {
        method: 'POST',
        body: new URLSearchParams({
            template_id: templateId,
            username: 'ggloopbot', // Free account
            password: process.env.IMGFLIP_PASSWORD || '',
            text0: topText,
            text1: bottomText,
        }),
    });

    const data: any = await response.json();

    if (data.success) {
        // Download generated meme
        const imageUrl = data.data.url;
        const imageResponse = await fetch(imageUrl);
        const buffer = await imageResponse.buffer();

        const tempPath = path.join(__dirname, '..', 'temp', `meme_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, buffer);

        return tempPath;
    }

    throw new Error('Meme generation failed');
}

/**
 * Popular meme templates
 */
export const MEME_TEMPLATES = {
    DRAKE: '181913649',
    DISTRACTED_BOYFRIEND: '112126428',
    IS_THIS: '100777631',
    EXPANDING_BRAIN: '93895088',
    TWO_BUTTONS: '87743020',
};

export { MEME_LIBRARY };
