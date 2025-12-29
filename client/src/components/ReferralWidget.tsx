/**
 * REFERRAL WIDGET COMPONENT
 * Shows user's referral stats and share options
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Copy, Check, Gift, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function ReferralWidget() {
    const [copied, setCopied] = useState(false);

    const { data: referralData } = useQuery({
        queryKey: ['/api/growth/referrals/stats'],
    });

    const { data: referralCode } = useQuery({
        queryKey: ['/api/growth/referrals/code'],
    });

    const handleCopy = () => {
        if (referralCode?.shareUrl) {
            navigator.clipboard.writeText(referralCode.shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!referralData || !referralCode) return null;

    return (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Refer & Earn
                </CardTitle>
                <CardDescription>
                    Share GG Loop with friends and earn points together
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-primary">{referralData.totalReferred}</div>
                        <div className="text-xs text-muted-foreground">Referred</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-primary">{referralData.activated}</div>
                        <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-primary">{referralData.totalEarned}</div>
                        <div className="text-xs text-muted-foreground">Points Earned</div>
                    </div>
                </div>

                {/* Share Link */}
                <div className="space-y-2">
                    <div className="text-sm font-medium">Your Referral Link</div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={referralCode.shareUrl}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm bg-background border rounded-md"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopy}
                            className="shrink-0"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Rewards Info */}
                <div className="bg-background/50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="font-semibold flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        How It Works
                    </div>
                    <ul className="space-y-1 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>You both get <strong className="text-foreground">100 points</strong> when they sign up</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>You get <strong className="text-foreground">50 points</strong> when they play their first game</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>You get <strong className="text-foreground">10%</strong> of their redemption value forever</span>
                        </li>
                    </ul>
                </div>

                {/* Pending Earnings */}
                {referralData.pendingEarnings > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <TrendingUp className="h-4 w-4" />
                            {referralData.pendingEarnings} points pending
                        </div>
                        <div className="text-muted-foreground mt-1">
                            Waiting for referred users to activate
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
