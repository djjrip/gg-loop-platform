/**
 * Social Sharing System
 * One-click viral sharing for referrals, achievements, rewards
 * Pre-written copy optimized for each platform
 */

import { Twitter, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
    referralCode?: string;
    achievement?: string;
    reward?: string;
    customMessage?: string;
}

/**
 * Twitter Share Button
 * Pre-written tweets optimized for engagement
 */
export function TwitterShare({ referralCode, achievement, reward }: ShareButtonProps) {
    const getMessage = () => {
        if (achievement) {
            return `Just unlocked: ${achievement} on @GGLoopOfficial 🏆\n\nEarning rewards while I game. You should too.\n\nggloop.io`;
        }
        if (reward) {
            return `Just redeemed: ${reward} on @GGLoopOfficial 🎁\n\nFree rewards for gaming? Yes please.\n\nggloop.io`;
        }
        if (referralCode) {
            return `I'm earning real rewards on @GGLoopOfficial just for gaming 🎮💰\n\nUse code: ${referralCode} for bonus points\n\nggloop.io`;
        }
        return `Gaming actually pays on @GGLoopOfficial 🚀\n\nPlay. Earn. Repeat.\n\nggloop.io`;
    };

    const handleShare = () => {
        const text = encodeURIComponent(getMessage());
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
            <Twitter className="h-4 w-4" />
            Share on Twitter
        </button>
    );
}

/**
 * Discord Share Button
 * Formatted for Discord embeds
 */
export function DiscordShare({ referralCode, achievement, reward }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const getMessage = () => {
        if (achievement) {
            return `🏆 **Achievement Unlocked!**\n${achievement}\n\nEarning rewards on GG LOOP while I game.\nJoin me: https://ggloop.io`;
        }
        if (reward) {
            return `🎁 **Just Redeemed!**\n${reward}\n\nGG LOOP pays you to game. For real.\nhttps://ggloop.io`;
        }
        if (referralCode) {
            return `🎮 **I'm earning rewards just for gaming**\n\nUse my code for bonus points: **${referralCode}**\n\nhttps://ggloop.io`;
        }
        return `🚀 **GG LOOP** - The gaming platform that actually pays\n\nConnect accounts → Win matches → Get rewards\n\nhttps://ggloop.io`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getMessage());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
            <MessageCircle className="h-4 w-4" />
            {copied ? '✓ Copied!' : 'Copy for Discord'}
        </button>
    );
}

/**
 * Reddit Share Button
 * Formatted for Reddit posts
 */
export function RedditShare({ referralCode }: ShareButtonProps) {
    const handleShare = () => {
        const title = encodeURIComponent('GG LOOP - Gaming rewards platform that actually pays');
        let url = 'https://ggloop.io';
        if (referralCode) {
            url += `?ref=${referralCode}`;
        }
        const encodedUrl = encodeURIComponent(url);

        window.open(`https://reddit.com/submit?url=${encodedUrl}&title=${title}`, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-[#FF4500] hover:bg-[#e63e00] text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
            <Share2 className="h-4 w-4" />
            Post on Reddit
        </button>
    );
}

/**
 * Share Button Group
 * Shows all share options together
 */
export function ShareButtonGroup({ referralCode, achievement, reward }: ShareButtonProps) {
    return (
        <div className="flex flex-wrap gap-3">
            <TwitterShare referralCode={referralCode} achievement={achievement} reward={reward} />
            <DiscordShare referralCode={referralCode} achievement={achievement} reward={reward} />
            {referralCode && <RedditShare referralCode={referralCode} />}
        </div>
    );
}

/**
 * Referral Link Card
 * Shows user's referral link with easy copy button
 */
export function ReferralLinkCard({ referralCode }: { referralCode: string }) {
    const [copied, setCopied] = useState(false);
    const referralUrl = `https://ggloop.io?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">🔗 Your Referral Link</h3>
            <p className="text-sm text-gray-400 mb-4">
                Share this link to earn 50 points per friend + squad bonuses
            </p>

            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3 mb-4">
                <input
                    type="text"
                    value={referralUrl}
                    readOnly
                    className="flex-1 bg-transparent text-white outline-none"
                />
                <button
                    onClick={handleCopy}
                    className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>

            <div className="space-y-3">
                <p className="text-xs text-gray-500 font-semibold">SHARE ON:</p>
                <ShareButtonGroup referralCode={referralCode} />
            </div>

            <div className="mt-4 pt-4 border-t border-purple-500/20">
                <p className="text-xs text-gray-400">
                    💡 <strong>Pro Tip:</strong> Share in gaming Discord servers and subreddits for max reach
                </p>
            </div>
        </div>
    );
}

/**
 * Achievement Share Prompt
 * Appears when user unlocks achievement
 */
export function AchievementSharePrompt({
    achievement,
    onClose
}: {
    achievement: string;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500 rounded-xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
                    <p className="text-lg text-purple-400">{achievement}</p>
                </div>

                <p className="text-gray-400 text-sm mb-6 text-center">
                    Flex on your friends 💪
                </p>

                <ShareButtonGroup achievement={achievement} />

                <button
                    onClick={onClose}
                    className="w-full mt-4 text-gray-500 hover:text-gray-300 transition-all"
                >
                    Skip
                </button>
            </div>
        </div>
    );
}
