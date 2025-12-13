import { Message } from 'discord.js';
import bannedWords from '../../data/banned-words.json';

interface ContentResult {
    violates: boolean;
    reason?: string;
    severity?: 'low' | 'medium' | 'high';
}

export async function checkContent(message: Message): Promise<ContentResult> {
    const content = message.content.toLowerCase();

    // Check for high severity (slurs, hate speech)
    for (const word of bannedWords.high) {
        if (content.includes(word.toLowerCase())) {
            return { violates: true, reason: 'Hate speech/slurs (auto-ban)', severity: 'high' };
        }
    }

    // Check for medium severity (harassment, profanity)
    for (const word of bannedWords.medium) {
        if (content.includes(word.toLowerCase())) {
            return { violates: true, reason: 'Harassment/excessive profanity', severity: 'medium' };
        }
    }

    // Check for low severity (mild profanity)
    let lowCount = 0;
    for (const word of bannedWords.low) {
        if (content.includes(word.toLowerCase())) {
            lowCount++;
        }
    }

    if (lowCount >= 3) {
        return { violates: true, reason: 'Excessive mild profanity', severity: 'low' };
    }

    return { violates: false };
}
