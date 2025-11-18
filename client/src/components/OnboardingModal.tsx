import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Zap,
  Gift,
  Gamepad2,
  ArrowRight,
  Check,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ONBOARDING_STEPS = [
  {
    icon: Trophy,
    title: "Welcome to GG Loop!",
    description: "A membership rewards platform designed for all gamers",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          GG Loop transforms your gaming passion into tangible rewards. Subscribe to a tier, 
          earn monthly points, and redeem them for gaming gear, gift cards, and exclusive items.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="font-bold text-lg">Basic</p>
            <p className="text-xs text-muted-foreground">$5/mo</p>
            <p className="text-primary font-mono text-sm">3,000 pts</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="font-bold text-lg">Pro</p>
            <p className="text-xs text-muted-foreground">$12/mo</p>
            <p className="text-primary font-mono text-sm">10,000 pts</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="font-bold text-lg">Elite</p>
            <p className="text-xs text-muted-foreground">$25/mo</p>
            <p className="text-primary font-mono text-sm">25,000 pts</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Free Tier: GG Coins",
    description: "Start earning without subscribing",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Not ready to subscribe? No problem! Our free tier lets you earn <span className="font-semibold text-primary">GG Coins</span> through login streaks.
        </p>
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Check className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold">Daily Login Streaks</p>
              <p className="text-xs text-muted-foreground">Earn GG Coins for consecutive logins</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Check className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold">Unlock Basic Trial</p>
              <p className="text-xs text-muted-foreground">500 GG Coins = 7-day Basic tier trial</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Gamepad2,
    title: "Optional Game Linking",
    description: "GG Loop is for ALL gamers",
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="font-semibold text-primary mb-2">🎮 Important: Game linking is 100% optional!</p>
          <p className="text-sm text-muted-foreground">
            You can subscribe, earn monthly points, and redeem rewards without linking any game accounts.
          </p>
        </div>
        <p className="text-muted-foreground">
          However, linking your League of Legends or Valorant account enables:
        </p>
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Automatic match tracking every 10 minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Bonus points for wins and achievements</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Stats dashboard and leaderboard rankings</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          You can link accounts anytime in Settings, or never link them at all!
        </p>
      </div>
    ),
  },
  {
    icon: Gift,
    title: "Redeem Rewards",
    description: "Turn points into real gaming gear",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Your points never expire (for 12 months), giving you time to save for bigger rewards or spend immediately.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">Gift Cards</p>
              <p className="text-xs text-muted-foreground">Steam, Amazon, Discord</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">Gaming Gear</p>
              <p className="text-xs text-muted-foreground">Mice, headsets, keyboards</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground pt-2">
          Browse the <span className="font-semibold">Shop</span> to see all available rewards!
        </p>
      </div>
    ),
  },
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-onboarding">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <StepIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center" data-testid="text-onboarding-title">
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-center" data-testid="text-onboarding-description">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6" data-testid="container-onboarding-content">
          {step.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
                data-testid={`progress-dot-${index}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                data-testid="button-skip-onboarding"
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              data-testid="button-onboarding-next"
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isLastStep && (
          <div className="text-center pt-2 border-t mt-2">
            <p className="text-sm text-muted-foreground mb-3">
              Ready to start your GG Loop journey?
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/subscription">
                <Button variant="outline" size="sm" data-testid="button-browse-tiers">
                  Browse Tiers
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" size="sm" data-testid="button-browse-rewards">
                  Browse Rewards
                </Button>
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
