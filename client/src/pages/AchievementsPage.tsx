import { useQuery } from "@tanstack/react-query";
import { Trophy, Award, Star, Medal, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Achievement {
    id: string;
    userId: string;
    gameId: string;
    title: string;
    description: string | null;
    pointsAwarded: number;
    achievedAt: Date;
}

export default function AchievementsPage() {
    const { data, isLoading } = useQuery<{ achievements: Achievement[] }>({
        queryKey: ["/api/achievements"],
    });

    const achievements = data?.achievements || [];

    // Group achievements by month
    const achievementsByMonth = achievements.reduce((acc, achievement) => {
        const date = new Date(achievement.achievedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(achievement);
        return acc;
    }, {} as Record<string, Achievement[]>);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getAchievementIcon = (points: number) => {
        if (points >= 1000) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (points >= 500) return <Medal className="w-6 h-6 text-purple-500" />;
        if (points >= 100) return <Star className="w-6 h-6 text-blue-500" />;
        return <Award className="w-6 h-6 text-gray-500" />;
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                    Achievements
                </h1>
                <p className="text-lg text-gray-600">
                    {achievements.length} achievement{achievements.length !== 1 ? 's' : ''} unlocked
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Total Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-gray-900">{achievements.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Points Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-orange-600">
                            {achievements.reduce((sum, a) => sum + a.pointsAwarded, 0).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-blue-600">
                            {Object.keys(achievementsByMonth).length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Active months</p>
                    </CardContent>
                </Card>
            </div>

            {/* Achievements Timeline */}
            {achievements.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No achievements yet
                            </h3>
                            <p className="text-gray-600">
                                Start playing games to unlock achievements and earn points!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {Object.entries(achievementsByMonth)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([monthKey, monthAchievements]) => {
                            const [year, month] = monthKey.split('-');
                            const monthName = monthNames[parseInt(month) - 1];

                            return (
                                <div key={monthKey}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {monthName} {year}
                                        </h2>
                                        <Badge variant="secondary">{monthAchievements.length}</Badge>
                                    </div>

                                    <div className="grid gap-4">
                                        {monthAchievements.map((achievement) => (
                                            <Card
                                                key={achievement.id}
                                                className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                                                            {getAchievementIcon(achievement.pointsAwarded)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                                {achievement.title}
                                                            </h3>
                                                            {achievement.description && (
                                                                <p className="text-gray-600 mb-3">
                                                                    {achievement.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 text-sm">
                                                                <Badge className="bg-orange-500">
                                                                    +{achievement.pointsAwarded} points
                                                                </Badge>
                                                                <span className="text-gray-500">
                                                                    {new Date(achievement.achievedAt).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
