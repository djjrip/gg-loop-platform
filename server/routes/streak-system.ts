export async function updateLoginStreak(userId: number) {
    return {
        streak: 1,
        justIncremented: true,
        bonusPoints: 10
    };
}

export function getNextMilestone(currentStreak: number) {
    return {
        days: currentStreak + 3,
        reward: 50,
        description: "3 Day Streak Warning"
    };
}
