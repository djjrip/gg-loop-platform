import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Camera,
  Video,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Plane,
  Coffee,
  Sparkles,
  ExternalLink,
  Package,
  Film,
  Scissors,
  Megaphone,
  Coins,
  Globe
} from "lucide-react";

interface CreatorTool {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  category: string;
}

const CREATOR_TOOLS: CreatorTool[] = [
  // Build Your Brand
  {
    name: "Shopify",
    description: "Start your online store and sell gaming merch",
    icon: Store,
    url: "https://shopify.pxf.io/gOjOZr",
    category: "brand"
  },
  {
    name: "jAlbum",
    description: "Create stunning photo galleries for your content",
    icon: Camera,
    url: "https://jalbum-affiliate-program.sjv.io/4GbGZn",
    category: "brand"
  },

  // Grow as a Creator
  {
    name: "IPRoyal",
    description: "Proxy services for content research and growth",
    icon: Globe,
    url: "https://iproyal.sjv.io/YR6RrP",
    category: "grow"
  },
  {
    name: "MarketXLS",
    description: "Market data and analytics for creators",
    icon: TrendingUp,
    url: "https://marketxls.pxf.io/yq0qn3",
    category: "grow"
  },

  // Sell Your Merch
  {
    name: "DHGate",
    description: "Wholesale marketplace for gaming merchandise",
    icon: Package,
    url: "https://dhgate.sjv.io/9LRLb5",
    category: "merch"
  },
  {
    name: "Modlily",
    description: "Fashion and apparel for your brand",
    icon: ShoppingBag,
    url: "https://modlily.sjv.io/LKVKzM",
    category: "merch"
  },
  {
    name: "EasyShip",
    description: "Shipping solutions for your merchandise",
    icon: Plane,
    url: "https://easyship.ilbqy6.net/e191dO",
    category: "merch"
  },

  // Monetize Your Audience
  {
    name: "Gemini Exchange",
    description: "Crypto platform for community monetization",
    icon: Coins,
    url: "https://gemini.sjv.io/raZaAv",
    category: "monetize"
  },

  // Level Up IRL
  {
    name: "CBD For Life",
    description: "Wellness products for gamers",
    icon: Sparkles,
    url: "https://imp.i295461.net/N9Z9nV",
    category: "lifestyle"
  },
  {
    name: "Coffee Bros",
    description: "Premium coffee for late-night gaming",
    icon: Coffee,
    url: "https://coffeebros.sjv.io/mOAODM",
    category: "lifestyle"
  },
  {
    name: "WhereLight",
    description: "Lighting solutions for streaming setups",
    icon: Sparkles,
    url: "https://wherelight.pxf.io/MAJA0q",
    category: "lifestyle"
  },
  {
    name: "PuzzleReady",
    description: "Mental wellness through puzzles",
    icon: Sparkles,
    url: "https://puzzlereadyaffiliateprogram.pxf.io/7a2aWg",
    category: "lifestyle"
  },
  {
    name: "Funwhole",
    description: "Creative building sets for relaxation",
    icon: Sparkles,
    url: "https://funwhole.sjv.io/qzJzeY",
    category: "lifestyle"
  },
  {
    name: "Alaska Airlines",
    description: "Travel rewards for IRL adventures",
    icon: Plane,
    url: "https://alaska.gqco.net/xLWL01",
    category: "lifestyle"
  },
  {
    name: "GearUP",
    description: "Gaming gear and equipment",
    icon: ShoppingBag,
    url: "https://gearup.sjv.io/09rPQM",
    category: "lifestyle"
  }
];

interface SectionProps {
  title: string;
  description: string;
  tools: CreatorTool[];
  icon: React.ComponentType<{ className?: string }>;
}

function ToolCard({ tool }: { tool: CreatorTool }) {
  const Icon = tool.icon;

  return (
    <Card className="hover-elevate h-full" data-testid={`card-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs">Partner</Badge>
        </div>
        <CardTitle className="text-xl mt-4">{tool.name}</CardTitle>
        <CardDescription className="text-sm">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            variant="outline"
            className="w-full"
            data-testid={`button-learn-more-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            Learn More
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

function ToolSection({ title, description, tools, icon: Icon }: SectionProps) {
  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-heading" data-testid={`text-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </h2>
        </div>
        <p className="text-muted-foreground text-lg ml-14">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export default function CreatorTools() {
  const brandTools = CREATOR_TOOLS.filter(t => t.category === "brand");
  const growTools = CREATOR_TOOLS.filter(t => t.category === "grow");
  const merchTools = CREATOR_TOOLS.filter(t => t.category === "merch");
  const monetizeTools = CREATOR_TOOLS.filter(t => t.category === "monetize");
  const lifestyleTools = CREATOR_TOOLS.filter(t => t.category === "lifestyle");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="px-4 py-2 text-sm" data-testid="badge-creator-tools">
            <Megaphone className="mr-2 h-3 w-3 inline" />
            Creator Resources
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold font-heading tracking-tight" data-testid="text-hero-title">
            Creator Tools
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Everything you need to build, grow, and monetize your gaming content creation journey.
            Curated tools and services trusted by creators worldwide.
          </p>
        </div>
      </section>

      {/* Tools Sections */}
      <div className="container mx-auto px-4 pb-24 space-y-16">
        <ToolSection
          title="Build Your Brand"
          description="Professional tools to establish your online presence and showcase your work"
          tools={brandTools}
          icon={Store}
        />

        <ToolSection
          title="Grow as a Creator"
          description="Software and resources to enhance your content quality and reach"
          tools={growTools}
          icon={Film}
        />

        <ToolSection
          title="Sell Your Merch"
          description="E-commerce platforms and shipping solutions for your branded merchandise"
          tools={merchTools}
          icon={ShoppingBag}
        />

        <ToolSection
          title="Monetize Your Audience"
          description="Financial tools and platforms to diversify your revenue streams"
          tools={monetizeTools}
          icon={DollarSign}
        />

        <ToolSection
          title="Level Up IRL"
          description="Lifestyle brands and services to support your well-being and success"
          tools={lifestyleTools}
          icon={Sparkles}
        />
      </div>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-primary/5 border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <h3 className="text-3xl font-bold font-heading">Ready to Start Your Journey?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join GG Loop to earn rewards while you game and grow your creator career with our partner tools.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a href="/subscription">
                <Button size="lg" data-testid="button-get-started">
                  Get Started
                </Button>
              </a>
              <a href="https://discord.gg/X6GXg2At2D" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" data-testid="button-join-community">
                  Join Our Community
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
