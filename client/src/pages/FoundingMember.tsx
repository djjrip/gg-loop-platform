import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Check, Shield, Users, AlertCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function FoundingMemberPage() {
  const [showFallback, setShowFallback] = useState(false);

  // Fetch PayPal URL from API
  const { data: paypalConfig } = useQuery<{ url: string | null; configured: boolean }>({
    queryKey: ["/api/founding-member/paypal-url"],
    queryFn: async () => {
      const res = await fetch("/api/founding-member/paypal-url");
      if (!res.ok) return { url: null, configured: false };
      return res.json();
    },
  });

  const paypalUrl = paypalConfig?.url;
  const isConfigured = paypalConfig?.configured ?? false;

  const handlePayClick = () => {
    if (paypalUrl && isConfigured) {
      window.open(paypalUrl, '_blank');
    } else {
      setShowFallback(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-ggloop-orange rounded-full p-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Become a Founding Member
          </h1>
          <p className="text-2xl font-bold text-yellow-200 mb-6">
            $29 Lifetime • Lock In Forever
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join the first 50 members and lock in lifetime benefits before the platform scales.
          </p>
        </div>

        {/* Main Offer Card */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-ggloop-orange/10 border-2 border-purple-500/30 mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Benefits */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">What You Get</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">2x Points Forever</div>
                      <div className="text-gray-400 text-sm">Permanent 2x multiplier on all activities</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">Name on Founding Members Wall</div>
                      <div className="text-gray-400 text-sm">Permanent recognition of your early support</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">Early Access to Every Feature</div>
                      <div className="text-gray-400 text-sm">First to try new rewards, challenges, and updates</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">Direct Line to Founder</div>
                      <div className="text-gray-400 text-sm">Exclusive Discord channel for feedback and requests</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">Vote on Which Games We Add Next</div>
                      <div className="text-gray-400 text-sm">Influence the roadmap and platform direction</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Pricing & CTA */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-6">
                    <div className="text-center mb-4">
                      <div className="text-5xl font-black text-white mb-2">$29</div>
                      <div className="text-gray-400">One-time payment</div>
                      <div className="text-sm text-gray-500 mt-2">First 50 only • Price increases to $49 after</div>
                    </div>
                    
                    {isConfigured && paypalUrl ? (
                      <div className="space-y-4">
                        <Button
                          onClick={handlePayClick}
                          className="w-full bg-gradient-to-r from-purple-600 to-ggloop-orange hover:from-purple-700 hover:to-ggloop-orange-dark text-white text-lg py-6 font-bold"
                          size="lg"
                        >
                          Pay $29 with PayPal
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                          <div className="text-blue-200 text-xs font-semibold mb-1">What happens next:</div>
                          <ol className="text-blue-300/80 text-xs space-y-1 list-decimal list-inside">
                            <li>Complete payment on PayPal</li>
                            <li>You'll receive a confirmation email</li>
                            <li>Upgrade processed manually within 24 hours</li>
                            <li>2x points multiplier activated after verification</li>
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-yellow-200 font-semibold mb-1">Payments Not Live Yet</div>
                              <div className="text-yellow-300/80 text-sm mb-2">
                                Payment processing is being configured. Check back in a few hours.
                              </div>
                              <div className="text-yellow-400/70 text-xs">
                                (PayPal link configuration in progress)
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <a
                            href="https://discord.gg/X6GXg2At2D"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button variant="outline" className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                              Join Discord for Updates
                            </Button>
                          </a>
                          <Link href="/subscription">
                            <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                              View Subscription Options
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparency Disclosure */}
        <Card className="bg-black/40 border border-white/5 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              How This Works (Manual Validation Phase)
            </h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                <strong className="text-white">During validation:</strong> Upgrades are processed manually within 24 hours of payment.
              </p>
              <p>
                <strong className="text-white">After payment:</strong> You'll receive a confirmation email. Your 2x points multiplier applies after verification.
              </p>
              <p>
                <strong className="text-white">Why manual:</strong> We're validating real demand before building automation. This ensures we build the right features.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fair Play Note */}
        <Card className="bg-black/40 border border-white/5">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Fair Play
            </h3>
            <p className="text-gray-300 text-sm">
              Rewards are verified. Suspicious activity is reviewed. Cheaters get removed. We're building a platform that rewards genuine skill, not exploits.
            </p>
          </CardContent>
        </Card>

        {/* Proof of Life Counter */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-6 py-3">
            <Users className="h-5 w-5 text-purple-300" />
            <span className="text-gray-300">
              Founding Members: <span className="text-yellow-300 font-semibold">Be the first.</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

