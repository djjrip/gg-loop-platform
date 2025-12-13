/**
 * Conversion Rate Optimization Components
 * Free, high-impact widgets that drive subscription conversions
 * 
 * Features:
 * - Points-to-money calculator
 * - Social proof counter
 * - Urgency triggers
 * - One-click upgrade CTAs
 */

import { useState, useEffect } from 'react';

/**
 * Points Value Calculator
 * Shows users the REAL VALUE of their points if they upgrade to Pro
 */
export function PointsValueCalculator({ currentPoints }: { currentPoints: number }) {
    const proMultiplier = 2;
    const eliteMultiplier = 3;

    const proValue = currentPoints * proMultiplier;
    const eliteValue = currentPoints * eliteMultiplier;

    const monthlyEarnings = 50 * 30; // Daily login * 30 days
    const proMonthly = monthlyEarnings * proMultiplier;
    const eliteMonthly = monthlyEarnings * eliteMultiplier;

    return (
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold mb-4">💰 Your Potential Earnings</h3>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Points:</span>
                    <span className="text-2xl font-bold text-white">{currentPoints.toLocaleString()}</span>
                </div>

                <div className="border-t border-purple-500/20 pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <span>As Pro Member:</span>
                        <span className="text-purple-400 font-bold">{proValue.toLocaleString()} pts</span>
                    </div>
                    <p className="text-sm text-gray-500">+{proMonthly.toLocaleString()} pts/month</p>
                </div>

                <div className="border-t border-purple-500/20 pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <span>As Elite Member:</span>
                        <span className="text-pink-400 font-bold">{eliteValue.toLocaleString()} pts</span>
                    </div>
                    <p className="text-sm text-gray-500">+{eliteMonthly.toLocaleString()} pts/month</p>
                </div>
            </div>

            <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-lg transition-all">
                Upgrade to Pro - $9.99/month
            </button>

            <p className="text-center text-xs text-gray-500 mt-2">
                Cancel anytime. No commitment.
            </p>
        </div>
    );
}

/**
 * Social Proof Counter
 * Shows growing user count to create FOMO
 */
export function SocialProofCounter() {
    const [count, setCount] = useState(1247); // Base count

    useEffect(() => {
        // Increment slowly to show "live" growth
        const interval = setInterval(() => {
            setCount(prev => prev + Math.floor(Math.random() * 3));
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400">
                <span className="text-white font-bold">{count.toLocaleString()}</span> gamers earning rewards
            </span>
        </div>
    );
}

/**
 * Limited Time Offer Banner
 * Creates urgency for first-time visitors
 */
export function LimitedOfferBanner() {
    const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 hours in seconds

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 text-center">
            <p className="font-bold">
                🔥 50% OFF First Month of Pro Membership
            </p>
            <p className="text-sm">
                Offer expires in: {hours}h {minutes}m {seconds}s
            </p>
        </div>
    );
}

/**
 * Inline Upgrade Prompt
 * Shows when user hits certain milestones
 */
export function InlineUpgradePrompt({
    trigger }: {
        trigger: 'points_threshold' | 'referral_milestone' | 'shop_visit'
    }) {
    const messages = {
        points_threshold: {
            title: "You're earning fast! 🚀",
            body: "Pro members would have 2x your points by now. Upgrade to accelerate your rewards.",
            cta: "Get 2x Points Forever"
        },
        referral_milestone: {
            title: "Your squad is growing! 👥",
            body: "Pro members get double points on referrals. Turn your network into serious earnings.",
            cta: "Unlock 2x Referral Rewards"
        },
        shop_visit: {
            title: "Want that faster? 💨",
            body: "Pro members earn rewards 2x faster. Get what you want in half the time.",
            cta: "Earn Rewards 2x Faster"
        }
    };

    const msg = messages[trigger];

    return (
        <div className="bg-gradient-to-br from-purple-900/40 to-transparent border border-purple-500/30 rounded-lg p-4 my-6">
            <h4 className="font-bold text-lg mb-2">{msg.title}</h4>
            <p className="text-gray-300 text-sm mb-4">{msg.body}</p>
            <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg transition-all">
                {msg.cta} →
            </button>
        </div>
    );
}

/**
 * Comparison Table
 * Shows Free vs Pro vs Elite side-by-side
 */
export function PricingComparison() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            {/* Free Tier */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-3xl font-bold mb-4">$0<span className="text-sm text-gray-500">/month</span></p>
                <ul className="space-y-2 text-sm">
                    <li>✅ Daily login rewards</li>
                    <li>✅ Referral bonuses</li>
                    <li>✅ Shop access</li>
                    <li>❌ 1x points multiplier</li>
                    <li>❌ Standard support</li>
                </ul>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-400 rounded-xl p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                </div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm text-gray-300">/month</span></p>
                <ul className="space-y-2 text-sm mb-6">
                    <li>✅ Everything in Free</li>
                    <li>✅ 2x points multiplier</li>
                    <li>✅ Pro profile badge</li>
                    <li>✅ Priority support</li>
                    <li>✅ Early feature access</li>
                </ul>
                <button className="w-full bg-white text-purple-900 font-bold py-3 rounded-lg hover:bg-gray-100 transition-all">
                    Upgrade to Pro
                </button>
            </div>

            {/* Elite Tier */}
            <div className="bg-gradient-to-br from-pink-900 to-rose-800 border border-pink-500 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-2">Elite</h3>
                <p className="text-3xl font-bold mb-4">$24.99<span className="text-sm text-gray-300">/month</span></p>
                <ul className="space-y-2 text-sm mb-6">
                    <li>✅ Everything in Pro</li>
                    <li>✅ 3x points multiplier</li>
                    <li>✅ Elite profile badge</li>
                    <li>✅ Options Hunter access</li>
                    <li>✅ VIP support</li>
                </ul>
                <button className="w-full bg-white text-pink-900 font-bold py-3 rounded-lg hover:bg-gray-100 transition-all">
                    Go Elite
                </button>
            </div>
        </div>
    );
}
