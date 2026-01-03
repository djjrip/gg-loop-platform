import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Check, Shield, Users, AlertCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function FoundingMemberPage() {
  const [loading, setLoading] = useState(false);

  // Fetch Stripe checkout session
  const handlePayClick = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/stripe/create-checkout");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
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
                    
                    <Button
                      onClick={handlePayClick}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-ggloop-orange hover:from-purple-700 hover:to-ggloop-orange-dark text-white text-lg py-6 font-bold"
                      size="lg"
                    >
                      {loading ? "Loading..." : "Pay $29 with Stripe"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How This Works */}
        <Card className="bg-black/40 border border-white/10 mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">How This Works (Manual Validation Phase)</h2>
            <div className="space-y-3 text-gray-300">
              <p className="text-sm">
                During validation, upgrades are processed manually within 24 hours. 2x points multiplier applies after verification.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fair Play */}
        <Card className="bg-black/40 border border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Fair Play</h2>
                <p className="text-sm text-gray-300">
                  Rewards are verified. Suspicious activity is reviewed. Cheaters get removed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
