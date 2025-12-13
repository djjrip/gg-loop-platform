/**
 * Trial Status Banner
 * Shows countdown and drives urgency to upgrade
 */

import { Clock, Zap } from 'lucide-react';
import { Link } from 'wouter';

interface TrialBannerProps {
    daysRemaining: number;
    bonusPointsEarned: number;
}

export function TrialBanner({ daysRemaining, bonusPointsEarned }: TrialBannerProps) {
    const getUrgencyColor = () => {
        if (daysRemaining === 1) return 'from-red-600 to-orange-600';
        if (daysRemaining <= 3) return 'from-orange-600 to-yellow-600';
        return 'from-purple-600 to-pink-600';
    };

    const getMessage = () => {
        if (daysRemaining === 1) {
            return {
                icon: '🚨',
                title: 'LAST DAY OF PRO TRIAL',
                subtitle: 'Upgrade now to keep 2x points forever',
            };
        }
        if (daysRemaining <= 3) {
            return {
                icon: '⏰',
                title: `${daysRemaining} DAYS LEFT`,
                subtitle: 'Keep crushing it with Pro benefits',
            };
        }
        return {
            icon: '✨',
            title: `PRO TRIAL ACTIVE - ${daysRemaining} days left`,
            subtitle: "You're earning 2x points on everything",
        };
    };

    const msg = getMessage();

    return (
        <div className={`bg-gradient-to-r ${getUrgencyColor()} text-white rounded-lg p-4 mb-6 shadow-lg`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">{msg.icon}</div>
                    <div>
                        <h3 className="font-bold text-lg">{msg.title}</h3>
                        <p className="text-sm opacity-90">{msg.subtitle}</p>
                    </div>
                </div>

                <Link href="/subscription">
                    <button className="bg-white text-purple-900 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Keep Pro
                    </button>
                </Link>
            </div>

            {bonusPointsEarned > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-sm">
                        💰 You've earned <strong>{bonusPointsEarned.toLocaleString()} bonus points</strong> during your trial.
                        Don't lose the 2x multiplier!
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Post-Trial Interstitial
 * Shows when trial expires, before user can continue
 */
export function TrialExpiredModal({
    bonusEarned,
    onDismiss
}: {
    bonusEarned: number;
    onDismiss: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500 rounded-xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">😢</div>
                    <h2 className="text-2xl font-bold mb-2">Your Pro Trial Has Ended</h2>
                    <p className="text-gray-400">
                        You earned <span className="text-purple-400 font-bold">{bonusEarned.toLocaleString()} bonus points</span> during your trial
                    </p>
                </div>

                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-2">What You're Losing:</h3>
                    <ul className="space-y-2 text-sm">
                        <li>❌ 2x points on everything</li>
                        <li>❌ Pro profile badge</li>
                        <li>❌ Priority support</li>
                        <li>❌ Early feature access</li>
                    </ul>
                </div>

                <Link href="/subscription">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-lg transition-all mb-3">
                        Keep Pro for $9.99/month →
                    </button>
                </Link>

                <button
                    onClick={onDismiss}
                    className="w-full text-gray-500 hover:text-gray-300 transition-all text-sm"
                >
                    Continue as Free
                </button>
            </div>
        </div>
    );
}
