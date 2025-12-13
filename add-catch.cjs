const fs = require('fs');

const content = fs.readFileSync('server/routes.ts', 'utf8');
const lines = content.split('\n');

// Insert catch block after line 906 (before line 907 which is index 906)
const catchBlock = `
      // TODO: Implement badge retrieval and complete profile response
      res.json({
        user: {
          id: user.id,
          username: user.username,
          totalPoints: user.totalPoints,
          profileImageUrl: user.profileImageUrl
        },
        achievements: achievements.slice(0, 10),
        leaderboardRankings,
        stats: {
          avgRank,
          joinedDaysAgo,
          totalAchievements: allAchievements.length
        }
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
`;

// Insert at line 907 (array index 906)
lines.splice(906, 0, catchBlock);

fs.writeFileSync('server/routes.ts', lines.join('\n'), 'utf8');
console.log('✅ Added missing catch block for try at line 860');
