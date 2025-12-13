import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@shared/schema";

interface MatchSubmission {
  id: string;
  gameId: string;
  gameName: string;
  matchType: string;
  notes: string | null;
  screenshotUrl: string | null;
  status: string;
  pointsAwarded: number | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export default function ReportMatch() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [matchType, setMatchType] = useState<string>("win");
  const [notes, setNotes] = useState("");

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: submissions, refetch: refetchSubmissions } = useQuery<MatchSubmission[]>({
    queryKey: ["/api/match-submissions"],
    enabled: isAuthenticated,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { gameId: string; matchType: string; notes: string }) => {
      const res = await apiRequest("POST", "/api/match-submissions", data);
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Match Win Recorded!",
        description: `You earned ${data.pointsAwarded || 0} points`,
      });
      setSelectedGame("");
      setMatchType("win");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/match-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGame) {
      toast({
        title: "Game Required",
        description: "Please select a game",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({
      gameId: selectedGame,
      matchType,
      notes,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Login Required</h1>
          <p className="text-muted-foreground">Please log in to report match wins.</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: Clock, color: "text-yellow-500", label: "Pending Review", variant: "secondary" as const },
    approved: { icon: CheckCircle, color: "text-green-500", label: "Approved", variant: "default" as const },
    rejected: { icon: XCircle, color: "text-red-500", label: "Rejected", variant: "destructive" as const },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading tracking-tight mb-2">Report Match Win</h1>
          <p className="text-muted-foreground">Submit your match wins and earn instant points</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Submit New Match</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="game">Game *</Label>
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger id="game" data-testid="select-game">
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games?.map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchType">Match Type</Label>
                <Select value={matchType} onValueChange={setMatchType}>
                  <SelectTrigger id="matchType" data-testid="select-match-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="win">Competitive Win</SelectItem>
                    <SelectItem value="ranked">Ranked Win</SelectItem>
                    <SelectItem value="tournament">Tournament Placement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details about your match..."
                  rows={4}
                  data-testid="textarea-notes"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitMutation.isPending}
                data-testid="button-submit"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Match"}
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">How It Works</h2>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs">1</span>
                  <span>Select the game you played and match type</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs">2</span>
                  <span>Submit and earn points instantly!</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs">3</span>
                  <span>View your match history and total points earned</span>
                </li>
              </ol>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Point Values</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Competitive Win:</span>
                  <span className="font-bold text-primary">+10 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ranked Win:</span>
                  <span className="font-bold text-primary">+15 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tournament Top 3:</span>
                  <span className="font-bold text-primary">+50 points</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {submissions && submissions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Your Submissions</h2>
            <div className="space-y-3">
              {submissions.map((submission) => {
                const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = config.icon;
                
                return (
                  <Card key={submission.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {submission.screenshotUrl && (
                        <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border">
                          <img 
                            src={submission.screenshotUrl} 
                            alt="Match screenshot" 
                            className="w-full h-full object-cover"
                            data-testid={`screenshot-${submission.id}`}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold" data-testid={`submission-game-${submission.id}`}>
                            {submission.gameName}
                          </h3>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize mb-1">
                          {submission.matchType.replace('-', ' ')}
                        </p>
                        {submission.notes && (
                          <p className="text-sm text-muted-foreground italic">{submission.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {submission.pointsAwarded && (
                        <div className="text-right">
                          <p className="text-2xl font-bold font-mono text-primary">
                            +{submission.pointsAwarded}
                          </p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
