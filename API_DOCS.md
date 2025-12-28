# GG Loop API Documentation

## Getting Started

GG Loop API allows you to integrate gaming rewards into your platform.

### Authentication

All API requests require an API key in the header:
```
X-API-Key: gg_your_api_key_here
```

Get your API key: https://ggloop.io/developer

### Pricing

- **Free**: 10,000 API calls/month
- **Pro**: $99/month - 100K calls/month
- **Business**: $499/month - 1M calls/month
- **Enterprise**: Custom pricing

---

## Endpoints

### Award Points

Award points to a user for gameplay activity.

**Endpoint:** `POST /api/v1/points/award`

**Request:**
```json
{
  "userId": "user_123",
  "points": 100,
  "reason": "Tournament 1st place",
  "metadata": {
    "tournamentId": "t_456",
    "game": "valorant"
  }
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user_123",
  "pointsAwarded": 100,
  "newBalance": 1500
}
```

---

### Get User Stats

Retrieve user statistics and verification status.

**Endpoint:** `GET /api/v1/users/:userId/stats`

**Response:**
```json
{
  "userId": "user_123",
  "totalPoints": 5000,
  "level": 10,
  "achievements": [
    {
      "id": "win_100",
      "name": "Century Club",
      "unlockedAt": "2025-01-15"
    }
  ],
  "verified": true,
  "trustScore": 95
}
```

---

## Use Cases

### Tournament Platforms
Award points automatically when tournaments complete:
```javascript
await ggloop.awardPoints(userId, 500, 'Tournament winner');
```

### Discord Bots
Reward active community members:
```javascript
const stats = await ggloop.getUserStats(discordUserId);
if (stats.level >= 10) {
  await giveDiscordRole(userId, 'Verified Gamer');
}
```

### Gaming Communities
Track player engagement across multiple games:
```javascript
const players = await ggloop.getLeaderboard('valorant');
```

---

## Rate Limits

- Free tier: 10K requests/month
- Pro tier: 100K requests/month
- Enterprise: Unlimited

---

## Support

- **Docs**: https://ggloop.io/docs
- **Discord**: https://discord.gg/ggloop
- **Email**: developers@ggloop.io
