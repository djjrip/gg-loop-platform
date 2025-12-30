export async function getLiveActivityFeed() {
    return [
        { type: "signup", user: "NewVibeCoder", timestamp: new Date().toISOString() },
        { type: "challenge", user: "CodeNinja", challenge: "Hello World", timestamp: new Date().toISOString() }
    ];
}
export async function getLiveStats() {
    return {
        activeUsers: 42,
        totalLinesCoded: 1337,
        currentVibe: 100
    };
}
