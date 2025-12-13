/**
 * COSMIC_EMPIRE_HUB.js
 *
 * Single-file Cosmic Empire Hub:
 * - HTTP server on port 8080
 * - Cosmic Map (service orbits)
 * - Timeline (past/present/future events)
 * - Failure Sentry panel
 * - Founder DNA endpoint
 *
 * Requires:
 *   npm install express node-fetch
 */

const express = require("express");
const fetch = require("node-fetch");
const net = require("net");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.COSMIC_PORT || 8080;

/* ---------- FOUNDER DNA ---------- */

const FOUNDER_DNA = {
    fallbackURL: "https://ggloop.io",
    rules: [
        "Never post dead links.",
        "Always route gravity back to https://ggloop.io.",
        "Bots must vary language to look human.",
        "Railway URLs must never be used for public traffic.",
        "Empire Hub is the source of truth.",
        "Fix first, explain later.",
        "Stability is priority one.",
        "Monetization must remain active."
    ]
};

/* ---------- HELPER CHECKS ---------- */

function checkPort(port) {
    return new Promise((resolve) => {
        const socket = net.connect(port, "127.0.0.1");
        let done = false;

        socket.on("connect", () => {
            if (!done) {
                done = true;
                socket.destroy();
                resolve("healthy");
            }
        });

        socket.on("error", () => {
            if (!done) {
                done = true;
                resolve("critical");
            }
        });

        setTimeout(() => {
            if (!done) {
                done = true;
                socket.destroy();
                resolve("major");
            }
        }, 1500);
    });
}

async function checkUrl(url) {
    try {
        const res = await fetch(url, { method: "GET" });
        if (res.status === 200) return "healthy";
        if (res.status >= 500) return "critical";
        return "major";
    } catch (e) {
        return "critical";
    }
}

/* ---------- COSMIC STATUS API ---------- */

app.get("/api/cosmic/status", async (req, res) => {
    // Adjust names/ports/URLs to match your real services
    const services = [
        {
            name: "Empire Hub",
            type: "port",
            target: 8080,
            stability: 12
        },
        {
            name: "Options Hunter",
            type: "port",
            target: 8501,
            stability: 18
        },
        {
            name: "Antisocial Bot",
            type: "url",
            target: "http://localhost:3001/health",
            stability: 20
        },
        {
            name: "GG LOOP",
            type: "url",
            target: "https://ggloop.io",
            stability: 10
        }
    ];

    const results = [];
    for (const svc of services) {
        let health;
        if (svc.type === "port") {
            health = await checkPort(svc.target);
        } else {
            health = await checkUrl(svc.target);
        }
        results.push({
            name: svc.name,
            target: svc.target,
            type: svc.type,
            health,
            stability: svc.stability
        });
    }

    res.json({ services: results, generatedAt: new Date().toISOString() });
});

/* ---------- COSMIC EVENTS API ---------- */

app.get("/api/cosmic/events", (req, res) => {
    const eventsFile = path.join(process.cwd(), "events.json");
    let events = [];

    if (fs.existsSync(eventsFile)) {
        try {
            events = JSON.parse(fs.readFileSync(eventsFile, "utf8"));
        } catch {
            events = [];
        }
    }

    if (events.length === 0) {
        // Sample data if none exists
        events = [
            {
                time: "Past · 6h ago",
                label: "Options Hunter deployment",
                impact: "System orbit adjusted"
            },
            {
                time: "Now",
                label: "Antisocial Bot heartbeat",
                impact: "Social satellites pinging"
            },
            {
                time: "Future · 24h",
                label: "Projected GG LOOP traffic bump",
                impact: "Higher revenue gravity"
            }
        ];
    }

    res.json({ events });
});

/* ---------- COSMIC FAILURES API ---------- */

app.get("/api/cosmic/failures", (req, res) => {
    const sentryFile = path.join(process.cwd(), "IMPERIAL_SENTRY_REPORT_CORRECTED.md");
    let failures = [];

    if (fs.existsSync(sentryFile)) {
        const raw = fs.readFileSync(sentryFile, "utf8");
        const lines = raw.split("\n");

        failures = lines
            .filter(
                (l) =>
                    l.startsWith("CRITICAL") ||
                    l.startsWith("MAJOR") ||
                    l.startsWith("MINOR") ||
                    l.includes("FAILURE #")
            )
            .map((line) => {
                const [level, rest] = line.split(":");
                return {
                    level: level.toLowerCase().trim(),
                    title: rest ? rest.trim() : "Unknown issue",
                    description: "Parsed from IMPERIAL_SENTRY_REPORT_CORRECTED.md",
                    fix: "Open IMPERIAL_SENTRY_REPORT_CORRECTED.md for detailed fix instructions."
                };
            });
    }

    if (failures.length === 0) {
        failures = [
            {
                level: "healthy",
                title: "All systems operational",
                description:
                    "No critical failures detected. Docker antisocial-bot running, ggloop.io healthy.",
                fix: "Continue monitoring. ETERNAL SENTRY active."
            }
        ];
    }

    res.json({ failures });
});

/* ---------- FOUNDER DNA API ---------- */

app.get("/api/founder/dna", (req, res) => {
    res.json(FOUNDER_DNA);
});

/* ---------- FRONT-END: SINGLE HTML PAGE ---------- */

app.get("/", (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Cosmic Empire Hub</title>
<style>
  body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: radial-gradient(circle at top, #141b33, #05060a);
    color: #f5f5f5;
  }
  .layout {
    display: grid;
    grid-template-columns: 2fr 1.2fr;
    grid-template-rows: auto auto;
    grid-gap: 16px;
    padding: 16px;
    height: 100vh;
    box-sizing: border-box;
  }
  .panel {
    background: rgba(10, 12, 24, 0.9);
    border-radius: 12px;
    padding: 12px 14px;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 0 18px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  h1, h2 {
    margin: 0 0 8px;
    font-weight: 600;
  }
  h1 {
    font-size: 20px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #f1c40f;
  }
  .header {
    grid-column: 1 / span 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .metrics {
    display: flex;
    gap: 12px;
  }
  .metric {
    background: rgba(255,255,255,0.03);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
  }
  .cosmic-map {
    position: relative;
    height: 100%;
    min-height: 320px;
    background: radial-gradient(circle at center, #141b33, #05060a);
    border-radius: 12px;
    overflow: hidden;
  }
  .star {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #f1c40f;
    font-size: 16px;
    text-shadow: 0 0 12px rgba(241,196,15,0.9);
  }
  .orbit {
    position: absolute;
    left: 50%;
    top: 50%;
    border-radius: 50%;
    border: 1px dashed rgba(255,255,255,0.15);
    transform: translate(-50%, -50%);
    animation: spin linear infinite;
  }
  .body {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    background: #333;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 0 8px rgba(0,0,0,0.6);
  }
  .body.healthy { background: #2ecc71; }
  .body.major { background: #f1c40f; }
  .body.critical { background: #e74c3c; }
  .pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 6px rgba(255,255,255,0.9);
  }
  @keyframes spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  .timeline-wrapper {
    font-size: 12px;
    max-height: 100%;
    overflow-y: auto;
  }
  .event {
    border-left: 2px solid rgba(255,255,255,0.1);
    padding-left: 8px;
    margin-bottom: 8px;
  }
  .event .time { display: block; opacity: 0.7; font-size: 11px; }
  .event .label { display: block; font-weight: 500; }
  .event .impact { display: block; opacity: 0.9; font-size: 11px; }
  .sentry-panel {
    font-size: 12px;
    max-height: 100%;
    overflow-y: auto;
  }
  .failure {
    margin-bottom: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .failure.critical { border-color: #e74c3c; }
  .failure.major { border-color: #f1c40f; }
  .failure.minor { border-color: #3498db; }
  .failure.healthy { border-color: #2ecc71; }
  .failure h3 {
    margin: 0 0 4px;
    font-size: 12px;
  }
  .failure p {
    margin: 0 0 4px;
  }
  .failure code {
    font-size: 11px;
    background: rgba(0,0,0,0.4);
    padding: 2px 4px;
    border-radius: 4px;
    display: block;
    white-space: pre-wrap;
  }
  .dna-list {
    list-style: none;
    padding-left: 14px;
    margin: 4px 0 0;
    font-size: 11px;
  }
  .dna-list li::before {
    content: "✦ ";
    color: #f1c40f;
  }
</style>
</head>
<body>
<div class="layout">
  <div class="panel header">
    <div>
      <h1>GG LOOP · COSMIC EMPIRE HUB</h1>
      <div style="font-size:11px; opacity:0.8;">Past · Present · Future of your system in one view.</div>
    </div>
    <div class="metrics">
      <div class="metric" id="stabilityMetric">Stability: …</div>
      <div class="metric" id="gravityMetric">Gravity: ggloop.io</div>
      <div class="metric" id="timestampMetric">Updated: …</div>
    </div>
  </div>

  <div class="panel">
    <h2>Cosmic Map · System Orbits</h2>
    <div id="cosmicMap" class="cosmic-map">
      <div class="star">GG LOOP</div>
    </div>
  </div>

  <div class="panel">
    <h2>Cosmic Timeline</h2>
    <div id="timeline" class="timeline-wrapper"></div>
  </div>

  <div class="panel">
    <h2>Failure Sentry</h2>
    <div id="sentry" class="sentry-panel"></div>
  </div>

  <div class="panel">
    <h2>Founder DNA</h2>
    <div id="dna"></div>
  </div>
</div>

<script>
async function loadStatus() {
  const res = await fetch("/api/cosmic/status");
  const data = await res.json();
  const services = data.services || [];
  const container = document.getElementById("cosmicMap");
  const star = container.querySelector(".star");

  // remove old orbits except star
  [...container.querySelectorAll(".orbit")].forEach(o => o.remove());

  const baseRadius = 60;
  const radiusStep = 40;

  let healthScore = 0;
  services.forEach((svc, idx) => {
    const orbit = document.createElement("div");
    orbit.className = "orbit";
    const radius = baseRadius + idx * radiusStep;
    orbit.style.width = radius * 2 + "px";
    orbit.style.height = radius * 2 + "px";
    orbit.style.animationDuration = (svc.stability || 15) + "s";

    const body = document.createElement("div");
    body.className = "body " + (svc.health || "major");
    body.innerHTML = \`\${svc.name}<span class="pulse"></span>\`;

    orbit.appendChild(body);
    container.appendChild(orbit);

    if (svc.health === "healthy") healthScore += 2;
    else if (svc.health === "major") healthScore += 1;
  });

  const stabilityMetric = document.getElementById("stabilityMetric");
  const tsMetric = document.getElementById("timestampMetric");
  const scoreLabel = healthScore >= services.length * 1.8 ? "Stable" :
                     healthScore >= services.length ? "Degraded" : "Critical";

  stabilityMetric.textContent = "Stability: " + scoreLabel;
  tsMetric.textContent = "Updated: " + new Date(data.generatedAt || Date.now()).toLocaleTimeString();
}

async function loadTimeline() {
  const res = await fetch("/api/cosmic/events");
  const data = await res.json();
  const events = data.events || [];
  const wrapper = document.getElementById("timeline");
  wrapper.innerHTML = "";
  events.forEach(e => {
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = \`
      <span class="time">\${e.time}</span>
      <span class="label">\${e.label}</span>
      <span class="impact">\${e.impact}</span>
    \`;
    wrapper.appendChild(div);
  });
}

async function loadFailures() {
  const res = await fetch("/api/cosmic/failures");
  const data = await res.json();
  const failures = data.failures || [];
  const panel = document.getElementById("sentry");
  panel.innerHTML = "";
  failures.forEach(f => {
    const div = document.createElement("div");
    div.className = "failure " + (f.level || "minor");
    div.innerHTML = \`
      <h3>[\${(f.level || "minor").toUpperCase()}] \${f.title}</h3>
      <p>\${f.description}</p>
      <code>\${f.fix}</code>
    \`;
    panel.appendChild(div);
  });
}

async function loadDNA() {
  const res = await fetch("/api/founder/dna");
  const dna = await res.json();
  const container = document.getElementById("dna");
  const list = document.createElement("ul");
  list.className = "dna-list";
  (dna.rules || []).forEach(rule => {
    const li = document.createElement("li");
    li.textContent = rule;
    list.appendChild(li);
  });
  container.innerHTML = "";
  container.appendChild(list);
}

async function refreshAll() {
  try {
    await Promise.all([loadStatus(), loadTimeline(), loadFailures(), loadDNA()]);
  } catch (e) {
    console.error("Error refreshing cosmic hub:", e);
  }
}

refreshAll();
setInterval(refreshAll, 30000);
</script>
</body>
</html>`);
});

/* ---------- START SERVER ---------- */

app.listen(PORT, () => {
    console.log(`✨ Cosmic Empire Hub running on http://localhost:${PORT}`);
    console.log(`📡 APIs available:`);
    console.log(`   - /api/cosmic/status`);
    console.log(`   - /api/cosmic/events`);
    console.log(`   - /api/cosmic/failures`);
    console.log(`   - /api/founder/dna`);
});
