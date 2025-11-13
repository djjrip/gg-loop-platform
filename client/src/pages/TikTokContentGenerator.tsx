import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Sparkles, TrendingUp, Zap, Clock, Coins } from "lucide-react";
import { tiktokTemplates, contentTips, trendingSounds, type TikTokTemplate } from "@/lib/tiktokTemplates";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";

export default function TikTokContentGenerator() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const copyToClipboard = async (template: TikTokTemplate) => {
    const fullScript = `${template.hook}\n\n${template.body}\n\n${template.cta}\n\n${template.hashtags.join(" ")}`;
    
    try {
      await navigator.clipboard.writeText(fullScript);
      setCopiedId(template.id);
      
      if (isAuthenticated) {
        try {
          const response = await apiRequest("POST", "/api/tiktok/track-copy", {
            templateId: template.id
          });
          const data = await response.json();
          
          if (data.pointsAwarded) {
            toast({
              title: "Script Copied! 🎉",
              description: `+${data.pointsAwarded} points earned for creating content! Post it on TikTok to help grow GG Loop.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          } else {
            toast({
              title: "Copied!",
              description: data.message || "Script copied to clipboard",
            });
          }
        } catch (error: any) {
          toast({
            title: "Copied!",
            description: "Script copied to clipboard",
          });
        }
      } else {
        toast({
          title: "Copied!",
          description: "Log in to earn points for creating TikTok content!",
        });
      }
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy script",
        variant: "destructive",
      });
    }
  };

  const filterByCategory = (category: string) => {
    if (category === "all") return tiktokTemplates;
    return tiktokTemplates.filter(t => t.category === category);
  };

  const categories = ["all", ...Array.from(new Set(tiktokTemplates.map(t => t.category)))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 py-16 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Free TikTok Content Generator</span>
          </div>
          <h1 className="text-5xl font-bold font-heading tracking-tight">
            Viral TikTok Scripts
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            12 proven templates to market GG Loop on TikTok. Just copy, film, and post.
          </p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">12</div>
            <div className="text-sm text-muted-foreground">Ready-to-Use Scripts</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Free Forever</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">9/10</div>
            <div className="text-sm text-muted-foreground">Avg Viral Score</div>
          </Card>
        </div>

        {/* Templates */}
        <section>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8 flex-wrap h-auto gap-2">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  data-testid={`tab-${cat}`}
                  className="capitalize"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-6">
                {filterByCategory(category).map(template => (
                  <Card key={template.id} className="p-6 hover-elevate" data-testid={`template-${template.id}`}>
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {template.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {template.duration}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Zap className="h-3 w-3 text-primary" />
                              <span className="font-medium">{template.viralScore}/10</span>
                              <span className="text-muted-foreground">viral score</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(template)}
                          size="default"
                          data-testid={`button-copy-${template.id}`}
                        >
                          {copiedId === template.id ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Script
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Script Content */}
                      <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">HOOK</div>
                          <p className="font-medium">{template.hook}</p>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">BODY</div>
                          <p className="whitespace-pre-line text-sm">{template.body}</p>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">CTA</div>
                          <p className="font-medium">{template.cta}</p>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">HASHTAGS</div>
                          <div className="flex flex-wrap gap-2">
                            {template.hashtags.map(tag => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Pro Tips */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Content Tips</h3>
            </div>
            <div className="space-y-4">
              {contentTips.map(tip => (
                <div key={tip.title}>
                  <h4 className="font-medium text-sm mb-2">{tip.title}</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {tip.tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Trending Sounds</h3>
            </div>
            <div className="space-y-3">
              {trendingSounds.map((sound, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-muted-foreground">{sound}</span>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.open('https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en', '_blank')}
                data-testid="button-tiktok-creative-center"
              >
                Open TikTok Creative Center
              </Button>
            </div>
          </Card>
        </section>

        {/* Quick Start Guide */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent">
          <h3 className="text-2xl font-bold mb-4">Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-lg font-bold text-primary mb-2">1. Pick Template</div>
              <p className="text-sm text-muted-foreground">Choose a script that matches your style</p>
            </div>
            <div>
              <div className="text-lg font-bold text-primary mb-2">2. Film Video</div>
              <p className="text-sm text-muted-foreground">Use your phone - authenticity {'>'}  production</p>
            </div>
            <div>
              <div className="text-lg font-bold text-primary mb-2">3. Post Daily</div>
              <p className="text-sm text-muted-foreground">Consistency beats perfection</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
