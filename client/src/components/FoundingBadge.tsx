/**
 * FOUNDING 1000 BADGE COMPONENT
 * Premium badge for first 1000 members
 * GG with infinity symbol, matches platform theme
 */

import { useQuery } from '@tanstack/react-query';

interface FoundingBadge {
    badgeNumber: number;
    grantedAt: string;
    perks: string[];
}

export function FoundingBadge({ badgeNumber }: { badgeNumber: number }) {
    return (
        <div className="relative group">
            {/* Badge Container */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-orange-500/20 border-2 border-orange-500/50 backdrop-blur-sm hover:border-orange-400 transition-all duration-300 cursor-pointer">

                {/* GG Infinity Logo */}
                <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-orange-400">
                        GG
                    </span>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        className="text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        {/* Infinity symbol */}
                        <path d="M12 12c-2-2-5-3.5-7-2s-2 4.5 0 6s5 0 7-2c2 2 5 3.5 7 2s2-4.5 0-6s-5 0-7 2z" />
                    </svg>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-orange-400/50 to-transparent" />

                {/* Badge Info */}
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-orange-300/80 uppercase tracking-wider">
                        Founding 1000
                    </span>
                    <span className="text-sm font-bold text-white">
                        #{badgeNumber.toString().padStart(4, '0')}
                    </span>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-4 rounded-lg bg-gray-900/95 border border-orange-500/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-2xl">
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
                        Founding Member Perks
                    </p>
                    <ul className="space-y-1 text-xs text-gray-300">
                        <li className="flex items-center gap-2">
                            <span className="text-orange-400">✓</span>
                            10% lifetime points bonus
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-orange-400">✓</span>
                            Locked-in pricing forever
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-orange-400">✓</span>
                            Early access to features
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-orange-400">✓</span>
                            Priority support
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-orange-400">✓</span>
                            Special Discord role
                        </li>
                    </ul>
                    <p className="text-xs text-gray-400 italic pt-2 border-t border-gray-700">
                        You were here at the beginning. That means something.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function FoundingBadgeCompact({ badgeNumber }: { badgeNumber: number }) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/30">
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="text-orange-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            >
                <path d="M12 12c-2-2-5-3.5-7-2s-2 4.5 0 6s5 0 7-2c2 2 5 3.5 7 2s2-4.5 0-6s-5 0-7 2z" />
            </svg>
            <span className="text-xs font-bold text-orange-400">
                Founder #{badgeNumber}
            </span>
        </div>
    );
}

// Hook to check if user is founder
export function useFoundingStatus() {
    return useQuery({
        queryKey: ['/api/user/founding-status'],
        queryFn: async () => {
            const res = await fetch('/api/user/founding-status');
            if (!res.ok) throw new Error('Failed to fetch founding status');
            return res.json() as Promise<FoundingBadge | null>;
        },
    });
}
