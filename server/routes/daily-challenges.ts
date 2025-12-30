export async function getActiveChallenges() {
    return [
        { id: 1, title: "Daily Vibe Check", description: "Log in and code for 30 minutes", reward: 100 }
    ];
}

export async function dailyChallengeJob() {
    return {
        generated: 1,
        date: new Date().toISOString()
    };
}
