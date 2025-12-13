import { useQuery } from "@tanstack/react-query";
import { Trophy, Zap, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface XPStats {
    currentLevel: number;
    currentXP: number;
    nextLevelXP: number;
    progressToNextLevel: number;
    totalPoints: number;
    gameStats: Array<{
        gameId: string;
        gameName: string;
        xpEarned: number;
        matchesPlayed: number;
    }>;
}

export default function XPTracker() {
    const { data: xpStats, isLoading } = useQuery<XPStats>({
        queryKey: ["/api/xp/stats"],
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        XP Tracker
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!xpStats) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Level Progress Card */}
            <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-50 to-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-6 h-6 text-orange-500" />
                        Level {xpStats.currentLevel}
                    </CardTitle>
                    <CardDescription>
                        {xpStats.currentXP} / {xpStats.nextLevelXP} XP to next level
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-orange-600">
                                {xpStats.progressToNextLevel.toFixed(1)}%
                            </span>
                        </div>
                        <Progress value={xpStats.progressToNextLevel} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Trophy className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Points</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {xpStats.totalPoints.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Current Level</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {xpStats.currentLevel}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Game Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        XP by Game
                    </CardTitle>
                    <CardDescription>Your XP breakdown across all games</CardDescription>
                </CardHeader>
                <CardContent>
                    {xpStats.gameStats.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No game activity yet. Start playing to earn XP!
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {xpStats.gameStats.map((game) => (
                                <div
                                    key={game.gameId}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">{game.gameName}</p>
                                        <p className="text-sm text-gray-600">
                                            {game.matchesPlayed} matches played
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-orange-600">
                                            {game.xpEarned.toLocaleString()} XP
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
