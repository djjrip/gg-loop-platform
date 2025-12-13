/**
 * Referral Contest Leaderboard Component
 * Shows live contest standings
 */

import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, DollarSign } from 'lucide-react';

export default function ReferralContestLeaderboard() {
    const { data: leaders } = useQuery({
        queryKey: ['/api/referrals/contest-leaderboard'],
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const prizes = [
        { rank: 1, cash: '$50', points: '5,000', emoji: '🥇' },
        { rank: 2, cash: '$25', points: '2,500', emoji: '🥈' },
        { rank: 3, cash: '$25', points: '2,500', emoji: '🥉' },
        { rank: 4 - 10, cash: '$10', points: '1,000', emoji: '🏅' },
    ];

    return (
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                    <div>
                        <h2 className="text-2xl font-bold">Monthly Referral Contest</h2>
                        <p className="text-sm text-gray-400">Top 10 win cash + bonus points!</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm text-gray-400">Resets</p>
                    <p className="font-bold">End of Month</p>
                </div>
            </div>

            {/* Prize Pool */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <p className="text-2xl mb-1">🥇</p>
                    <p className="font-bold">$50</p>
                    <p className="text-xs text-gray-400">+ 5K pts</p>
                </div>
                <div className="bg-gray-700/20 border border-gray-500/30 rounded-lg p-3 text-center">
                    <p className="text-2xl mb-1">🥈</p>
                    <p className="font-bold">$25</p>
                    <p className="text-xs text-gray-400">+ 2.5K pts</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 text-center">
                    <p className="text-2xl mb-1">🥉</p>
                    <p className="font-bold">$25</p>
                    <p className="text-xs text-gray-400">+ 2.5K pts</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 text-center">
                    <p className="text-2xl mb-1">🏅</p>
                    <p className="font-bold">$10</p>
                    <p className="text-xs text-gray-400">4th-10th</p>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
                {leaders?.map((leader: any, index: number) => {
                    const prize = index === 0 ? prizes[0] : index === 1 ? prizes[1] : index === 2 ? prizes[2] : prizes[3];

                    return (
                        <div
                            key={leader.userId}
                            className={`flex items-center justify-between p-4 rounded-lg border ${index === 0 ? 'bg-yellow-900/20 border-yellow-500/50' :
                                    index === 1 ? 'bg-gray-700/20 border-gray-500/50' :
                                        index === 2 ? 'bg-orange-900/20 border-orange-500/50' :
                                            'bg-purple-900/10 border-purple-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold opacity-50">#{index + 1}</div>
                                <div className="text-2xl">{prize.emoji}</div>
                                <div>
                                    <p className="font-bold text-white">{leader.firstName || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-400">{leader.referralCount} referrals this month</p>
                                </div>
                            </div>

                            {index < 10 && (
                                <div className="text-right">
                                    <p className="font-bold text-green-400">{typeof prize.cash === 'string' ? prize.cash : '$10'}</p>
                                    <p className="text-xs text-gray-400">
                                        + {typeof prize.points === 'string' ? prize.points : '1,000'} pts
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* CTA */}
            <div className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-center">
                <p className="font-bold mb-2">Want to compete?</p>
                <p className="text-sm mb-3 opacity-90">
                    Share your referral link. Top 10 win cash + points monthly!
                </p>
                <button className="bg-white text-purple-900 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-all">
                    Get Referral Link →
                </button>
            </div>
        </div>
    );
}
