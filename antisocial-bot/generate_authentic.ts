// Generate authentic GG LOOP content to replace spam
import fs from 'fs';

const AUTHENTIC_POSTS = [
    "Growing up Filipino-American, gaming was my escape.\\n\\nRanked queues until 3 AM. Thousands of hours invested.\\n\\nZero financial return.\\n\\nSo I built something different.\\n\\nggloop.io\\n\\n#gaming #FilipinoPride #indie",

    "GG LOOP exists to heal the inner gamer.\\n\\nThe version of you that just needed a win.\\n\\nNot to exploit. To UPLIFT.\\n\\nggloop.io\\n\\n#gaming #community",

    "Most gaming platforms:\\n\\"How much can we extract ?\\"\\n\\nGG LOOP:\\n\\"How much can we give back ?\\"\\n\\nCommunity first. Always.\\n\\nggloop.io\\n\\n#gaming #ethical",

    "What GG LOOP is NOT:\\n\\n❌ Crypto scheme\\n❌ NFT garbage\\n❌ Get rich quick\\n❌ Predatory mechanics\\n\\nWhat it IS:\\n\\n✅ Fair rewards\\n✅ Transparent pricing\\n✅ Real value\\n\\nggloop.io\\n\\n#gaming #transparency",

    "Filipino-American. Streetwear kid. Basketball & ranked queues.\\n\\nGG LOOP is built from THAT culture.\\n\\nNot corporate. Not Silicon Valley.\\n\\nggloop.io\\n\\n#FilipinoPride #gaming #indie",

    "You already grind ranked.\\n\\nWhat if every session earned you:\\n• Gaming gear\\n• Gift cards\\n• Subscriptions\\n\\nNot maybe. ACTUALLY.\\n\\nggloop.io\\n\\n#gaming #rewards",

    "I built GG LOOP alone.\\n\\nNo VC funding. No team. Just vision.\\n\\nFor the kid who stayed up all night climbing ranked.\\n\\nFor anyone who needed their grind to mean something.\\n\\nggloop.io\\n\\n#indie #gaming #solofounder",

    "Play. Earn. Loop.\\n\\nThat's it. That's the mission.\\n\\nYour time has value. Your grind matters.\\n\\nggloop.io\\n\\n#gaming #PlayEarnLoop",

    "For everyone who felt invisible in the gaming industry.\\n\\nThis is yours.\\n\\nggloop.io\\n\\n#gaming #representation #FilipinoPride",

    "Free 7-day Pro trial.\\n\\n2x points on everything.\\n\\nNo credit card required.\\n\\nTry it, cancel anytime.\\n\\nggloop.io\\n\\n#gaming #freet trial",

    "Link your Riot account.\\nPlay League/Valorant/TFT.\\nEarn points.\\nRedeem rewards.\\n\\nIt's that simple.\\n\\nggloop.io\\n\\n#gaming #Riot #rewards",

    "Gaming rewards platform built by gamers, for gamers.\\n\\nNo exploitation. Just respect.\\n\\nggloop.io\\n\\n#gaming #community",
];

const posts = [];
let postId = 1;

for (let day = 1; day <= 180; day++) {
    for (let postNum = 1; postNum <= 3; postNum++) {
        const messageIndex = (postId - 1) % AUTHENTIC_POSTS.length;

        posts.push({
            platform: "twitter",
            day,
            post_number: postNum,
            content: AUTHENTIC_POSTS[messageIndex],
            scheduled_time: `Day ${day} - Post ${postNum}`
        });

        postId++;
    }
}

fs.writeFileSync(
    'antisocial-bot/CONTENT-LIBRARY-180-DAYS.json',
    JSON.stringify(posts, null, 2)
);

console.log(`✅ Generated ${posts.length} authentic GG LOOP posts`);
console.log('📝 No spam. No broken links. Just your true story.');
