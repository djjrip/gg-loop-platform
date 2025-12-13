const express = require("express");
const session = require("express-session");
const Database = require("@replit/database");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");

const app = express();
const db = new Database();

app.use(express.json());
app.use(express.static("."));

app.use(session({
  secret: process.env.SESSION_SECRET || "ggloop-arcade-demo-secret",
  resave: false,
  saveUninitialized: true
}));

let CONFIG = JSON.parse(fs.readFileSync("./config.json"));

function getUserKey(req){
  if (!req.session.userId){
    req.session.userId = "demoUser-" + Math.random().toString(36).substring(2,10);
  }
  return req.session.userId;
}

async function getOrInitUser(req){
  const key = "user:" + getUserKey(req);
  let user = await db.get(key);
  if (!user){
    user = {
      id: getUserKey(req),
      tier: "free",
      points: 0,
      pointsThisMonth: 0,
      winsThisMonth: 0
    };
    await db.set(key, user);
  }
  return user;
}

async function saveUser(user){
  const key = "user:" + user.id;
  await db.set(key, user);
}

app.get("/api/me", async (req, res) => {
  const user = await getOrInitUser(req);
  res.json({ user, tiers: CONFIG.tiers });
});

// mock win endpoint (no Riot API; just demo)
app.post("/api/mock-win", async (req, res) => {
  const user = await getOrInitUser(req);
  const tierInfo = CONFIG.tiers[user.tier] || CONFIG.tiers["free"];

  if (user.pointsThisMonth >= tierInfo.monthly_cap){
    return res.json({ success:false, message:`Monthly cap reached for ${tierInfo.name} tier. Upgrade to earn more.`, user });
  }

  const pts = tierInfo.points_per_win;
  user.points += pts;
  user.pointsThisMonth += pts;
  user.winsThisMonth += 1;
  await saveUser(user);

  res.json({ success:true, message:`Win logged! +${pts} pts`, user });
});

// later this will be called by PayPal/Stripe webhook
app.post("/api/set-tier", async (req, res) => {
  const { tier } = req.body;
  if (!CONFIG.tiers[tier]) return res.status(400).json({ message:"Invalid tier" });
  const user = await getOrInitUser(req);
  user.tier = tier;
  await saveUser(user);
  res.json({ success:true, user });
});

// rewards listing
app.get("/api/rewards", (req,res)=>{
  res.json(CONFIG.rewards_catalog);
});

// leaderboard
app.get("/api/leaderboard", async (req,res)=>{
  const keys = await db.list("user:");
  const users = [];
  for (const key of keys){
    const u = await db.get(key);
    if (u) users.push(u);
  }
  users.sort((a,b)=>b.points - a.points);
  res.json(users.slice(0,50));
});

// redeem endpoint
app.post("/api/redeem", async (req,res)=>{
  const { rewardId } = req.body;
  const reward = CONFIG.rewards_catalog[rewardId];
  if (!reward) return res.status(400).json({ message:"Unknown reward" });
  const user = await getOrInitUser(req);

  if (user.points < reward.cost){
    return res.json({ success:false, message:"Not enough points", user });
  }
  user.points -= reward.cost;
  await saveUser(user);

  const logKey = `redeem:${user.id}:${Date.now()}`;
  await db.set(logKey, { userId:user.id, rewardId, at:Date.now() });

  res.json({ success:true, message:`Redeemed: ${reward.label}`, user });
});

// profit safety calculator
app.post("/api/profit-calc", (req,res)=>{
  const { freeUsers=0, basicUsers=0, proUsers=0, eliteUsers=0,
          basicReward=3, proReward=6, eliteReward=12,
          serverCost=30 } = req.body;

  const tierPrices = {free:0, basic:5, pro:12, elite:25};

  const revenue = 
    basicUsers*tierPrices.basic +
    proUsers*tierPrices.pro +
    eliteUsers*tierPrices.elite;

  const rewardCost =
    basicUsers*basicReward +
    proUsers*proReward +
    eliteUsers*eliteReward;

  const profit = revenue - rewardCost - serverCost;

  res.json({ revenue, rewardCost, serverCost, profit });
});

app.listen(5000, () => {
  console.log("GG LOOP ARCADE v1 running on port 5000");
});
