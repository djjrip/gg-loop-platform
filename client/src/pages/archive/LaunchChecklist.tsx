import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ExternalLink, Rocket } from "lucide-react";
import { Link } from "wouter";

export default function LaunchChecklist() {
  const sections = [
    {
      title: "Platform Ready (100%)",
      status: "complete",
      items: [
        { done: true, text: "Subscription system (Basic/Pro/Elite tiers)", detail: "Stripe integration live" },
        { done: true, text: "Points engine with caps & multipliers", detail: "Tier-based monthly point caps" },
        { done: true, text: "Rewards catalog with 18+ items", detail: "Gift cards, gear, experiences" },
        { done: true, text: "Riot API integration", detail: "League/VALORANT verification" },
        { done: true, text: "Sponsored challenges system", detail: "Ready for brand campaigns" },
        { done: true, text: "Admin dashboard", detail: "Sponsor analytics + management" },
        { done: true, text: "Public profiles & trophy case", detail: "Shareable achievements" },
        { done: true, text: "Twitch OAuth linking", detail: "Show linked status on profiles" },
      ],
    },
    {
      title: "Go Live NOW",
      status: "action",
      items: [
        { done: false, text: "Send 20 Twitch streamer invites TODAY", action: "/twitch-outreach", detail: "Use ready-to-send templates" },
        { done: false, text: "Post in 3 Discord gaming servers", action: "/twitch-outreach", detail: "Copy/paste announcement" },
        { done: false, text: "Goal: 10-20 signups this week", detail: "Track with UTM codes" },
      ],
    },
    {
      title: "Week 1: Sponsor Outreach",
      status: "pending",
      items: [
        { done: false, text: "Monday: Send emails to G Fuel, Razer, SteelSeries, Discord, Logitech", action: "/sponsor-outreach", detail: "Templates ready" },
        { done: false, text: "Wednesday: Follow up #1 with non-responders", detail: "Same email thread" },
        { done: false, text: "Friday: Follow up #2 with value-add", detail: "Share analytics dashboard" },
        { done: false, text: "Goal: 1+ sponsor interested by end of week", detail: "Schedule call" },
      ],
    },
    {
      title: "Week 2: Investor Outreach",
      status: "pending",
      items: [
        { done: false, text: "Research 10 gaming VCs/angels on LinkedIn", action: "/investor-outreach", detail: "Bitkraft, Makers Fund, 1Up" },
        { done: false, text: "Send 10 personalized investor emails", action: "/investor-outreach", detail: "Update metrics first" },
        { done: false, text: "Ask network for warm intros", detail: "LinkedIn connections" },
        { done: false, text: "Goal: 2+ investor calls scheduled", detail: "15-min intro calls" },
      ],
    },
    {
      title: "Week 3-6: Validation Sprint",
      status: "pending",
      items: [
        { done: false, text: "Run acquisition experiments (Reddit ads, Discord, TikTok)", action: "/roadmap", detail: "$200-300 budget" },
        { done: false, text: "Contact 5 wholesale gift card suppliers", action: "/roadmap", detail: "Request 30%+ discount quotes" },
        { done: false, text: "Launch first sponsor pilot campaign", detail: "$500-1,000 budget" },
        { done: false, text: "Track: conversion rate, CAC, redemption behavior", detail: "Validate unit economics" },
        { done: false, text: "Week 6: Go/no-go decision", action: "/roadmap", detail: "See full roadmap" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Launch Checklist</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Everything you need to go live TODAY and validate GG Loop in 6 weeks.
          </p>

          <Card className="border-2 border-green-600 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Platform is 100% Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    All core features built and working. Rewards catalog loaded. Stripe live.
                    You can start inviting users RIGHT NOW.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <Card
              key={idx}
              data-testid={`section-${idx}`}
              className={
                section.status === 'complete'
                  ? 'border-2 border-green-600'
                  : section.status === 'action'
                  ? 'border-2 border-primary'
                  : ''
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  {section.status === 'complete' && (
                    <Badge className="bg-green-600">Complete</Badge>
                  )}
                  {section.status === 'action' && (
                    <Badge className="bg-primary">Action Required</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-start gap-3"
                      data-testid={`item-${idx}-${itemIdx}`}
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className={item.done ? 'line-through text-muted-foreground' : ''}>
                              {item.text}
                            </div>
                            {item.detail && (
                              <div className="text-sm text-muted-foreground mt-0.5">
                                {item.detail}
                              </div>
                            )}
                          </div>
                          {item.action && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              data-testid={`button-action-${idx}-${itemIdx}`}
                            >
                              <Link href={item.action}>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-primary/5 border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Your Action Plan (Do These NOW)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Today (30 minutes):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                <li data-testid="text-action-today-1">
                  Go to <Link href="/twitch-outreach" className="text-primary underline">/twitch-outreach</Link> → Copy template
                </li>
                <li data-testid="text-action-today-2">
                  Open Twitch → Browse League/VALORANT streams (5-50 viewers)
                </li>
                <li data-testid="text-action-today-3">
                  Send 20 DMs with personalized template
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Monday Morning (1 hour):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                <li data-testid="text-action-monday-1">
                  Go to <Link href="/sponsor-outreach" className="text-primary underline">/sponsor-outreach</Link>
                </li>
                <li data-testid="text-action-monday-2">
                  Send 5 sponsor emails: G Fuel, Razer, SteelSeries, Discord, Logitech
                </li>
                <li data-testid="text-action-monday-3">
                  Set calendar reminder: Follow up Wed/Fri
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">This Week (2-3 hours):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                <li>Send 10 investor emails (<Link href="/investor-outreach" className="text-primary underline">templates here</Link>)</li>
                <li>Post in 5 Discord gaming servers</li>
                <li>Research gift card wholesalers</li>
              </ol>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Full 6-Week Roadmap:</strong> <Link href="/roadmap" className="text-primary underline">See detailed validation plan</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
