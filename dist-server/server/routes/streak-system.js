export async function updateLoginStreak(userId) {
    return {
        streak: 1,
        justIncremented: true,
        bonusPoints: 10
    };
}
export function getNextMilestone(currentStreak) {
    return {
        days: currentStreak + 3,
        reward: 50,
        description: "3 Day Streak Warning"
    };
}
