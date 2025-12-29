#!/usr/bin/env node

/**
 * INNOVATION: Slack/Discord webhook notifier
 * Sends automated alerts for critical events
 * Revenue milestones, churn alerts, system health
 */

import fetch from 'node-fetch';
import { db } from "../server/db.js";
import { users, subscriptions } from "@shared/schema";
import { sql } from "drizzle-orm";

// Configuration (set these in environment variables)
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Alert types and their configurations
const ALERTS = {
  NEW_SUBSCRIBER: {
    emoji: '💰',
    color: 0x00FF00, // Green
    importance: 'high'
  },
  CHURN: {
    emoji: '⚠️',
    color: 0xFF9900, // Orange
    importance: 'high'
  },
  REVENUE_MILESTONE: {
    emoji: '🎉',
    color: 0x00FF00, // Green
    importance: 'critical'
  },
  NEW_USER: {
    emoji: '👋',
    color: 0x0099FF, // Blue
    importance: 'medium'
  },
  CRITICAL_ERROR: {
    emoji: '🚨',
    color: 0xFF0000, // Red
    importance: 'critical'
  },
  HIGH_VALUE_ACTION: {
    emoji: '⭐',
    color: 0xFFD700, // Gold
    importance: 'high'
  }
};

async function sendDiscordNotification(alertType, title, description, fields = []) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('⚠️  Discord webhook not configured');
    return;
  }

  const alert = ALERTS[alertType];
  
  const embed = {
    title: `${alert.emoji} ${title}`,
    description,
    color: alert.color,
    fields,
    timestamp: new Date().toISOString(),
    footer: {
      text: 'GG LOOP Notifications'
    }
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
    console.log(`✅ Discord notification sent: ${title}`);
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error.message);
  }
}

async function sendSlackNotification(alertType, title, description, fields = []) {
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️  Slack webhook not configured');
    return;
  }

  const alert = ALERTS[alertType];
  
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${alert.emoji} ${title}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: description
      }
    }
  ];

  // Add fields if provided
  if (fields.length > 0) {
    blocks.push({
      type: 'section',
      fields: fields.map(f => ({
        type: 'mrkdwn',
        text: `*${f.name}*\n${f.value}`
      }))
    });
  }

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks })
    });
    console.log(`✅ Slack notification sent: ${title}`);
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error.message);
  }
}

// Wrapper to send to both platforms
async function notify(alertType, title, description, fields = []) {
  await Promise.all([
    sendDiscordNotification(alertType, title, description, fields),
    sendSlackNotification(alertType, title, description, fields)
  ]);
}

// Example usage functions
async function notifyNewSubscriber(username, tier, amount) {
  await notify(
    'NEW_SUBSCRIBER',
    'New Subscriber! 🎉',
    `${username} just subscribed to ${tier}`,
    [
      { name: 'Tier', value: tier, inline: true },
      { name: 'Amount', value: `$${amount}`, inline: true },
      { name: 'User', value: username, inline: true }
    ]
  );
}

async function notifyRevenueMilestone(milestone, currentMRR) {
  await notify(
    'REVENUE_MILESTONE',
    `$${milestone} MRR Milestone Reached!`,
    `Platform has crossed $${milestone}/month in recurring revenue!`,
    [
      { name: 'Current MRR', value: `$${currentMRR}`, inline: true },
      { name: 'Milestone', value: `$${milestone}`, inline: true }
    ]
  );
}

async function notifyChurn(username, tier, reason = 'Unknown') {
  await notify(
    'CHURN',
    'Subscriber Churned',
    `${username} cancelled their ${tier} subscription`,
    [
      { name: 'User', value: username, inline: true },
      { name: 'Tier', value: tier, inline: true },
      { name: 'Reason', value: reason, inline: true }
    ]
  );
}

async function notifyNewUser(username, source = 'Direct') {
  await notify(
    'NEW_USER',
    'New User Signup',
    `${username} just joined the platform`,
    [
      { name: 'Username', value: username, inline: true },
      { name: 'Source', value: source, inline: true }
    ]
  );
}

async function notifyCriticalError(errorType, message, stackTrace = '') {
  await notify(
    'CRITICAL_ERROR',
    'Critical System Error',
    `${errorType}: ${message}`,
    [
      { name: 'Error Type', value: errorType, inline: false },
      { name: 'Stack Trace', value: stackTrace.substring(0, 500), inline: false }
    ]
  );
}

// Export for use in other modules
export {
  notify,
  notifyNewSubscriber,
  notifyRevenueMilestone,
  notifyChurn,
  notifyNewUser,
  notifyCriticalError
};

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔔 Testing notification system...\n');
  
  // Test notification
  await notify(
    'NEW_SUBSCRIBER',
    'Test Notification',
    'This is a test of the notification system',
    [
      { name: 'Status', value: 'Testing', inline: true },
      { name: 'Time', value: new Date().toLocaleString(), inline: true }
    ]
  );
  
  console.log('\n✅ If configured, check Discord/Slack for notification');
  console.log('\nTo configure:');
  console.log('1. Discord: Create webhook in channel settings');
  console.log('2. Slack: Create incoming webhook app');
  console.log('3. Set environment variables:');
  console.log('   export DISCORD_WEBHOOK_URL="your_discord_webhook"');
  console.log('   export SLACK_WEBHOOK_URL="your_slack_webhook"');
}

/*
USAGE:

In your application code:
```javascript
import { notifyNewSubscriber, notifyRevenueMilestone } from './scripts/notify.js';

// When user subscribes
await notifyNewSubscriber(user.username, 'Pro', 12);

// When milestone hit
await notifyRevenueMilestone(100, 102.50);
```

SETUP:
1. Create Discord webhook: Server Settings → Integrations → Webhooks
2. Create Slack webhook: https://api.slack.com/messaging/webhooks
3. Set in Railway:
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
*/
