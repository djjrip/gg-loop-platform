import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RiotVerificationProps {
    game: 'valorant' | 'league';
    title: string;
    description: string;
    regions: { value: string; label: string }[];
}

export function RiotAccountVerification({ game, title, description, regions }: RiotVerificationProps) {
    const { toast } = useToast();
    const [step, setStep] = useState<'input' | 'verify'>('input');
    const [riotId, setRiotId] = useState('');
    const [region, setRegion] = useState(regions[0].value);
    const [verificationCode, setVerificationCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [autoCheckInterval, setAutoCheckInterval] = useState<NodeJS.Timeout | null>(null);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (autoCheckInterval) clearInterval(autoCheckInterval);
        };
    }, [autoCheckInterval]);

    const handleRequestCode = async () => {
        if (!riotId || !riotId.includes('#')) {
            toast({
                variant: "destructive",
                title: "Invalid Riot ID",
                description: "Format: GameName#TAG (e.g., Faker#KR1)"
            });
            return;
        }

        setIsRequesting(true);
        try {
            const [gameName, tagLine] = riotId.split('#');
            const res = await fetch('/api/riot/verification/request-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ game, gameName, tagLine, region })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to request verification');
            }

            const data = await res.json();
            setVerificationCode(data.verificationCode);
            setStep('verify');

            toast({
                title: "Verification code generated!",
                description: `Add "${data.verificationCode}" to your Riot ID`
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            });
        } finally {
            setIsRequesting(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(verificationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Copied!",
            description: "Verification code copied to clipboard"
        });
    };

    const checkVerification = async () => {
        try {
            const res = await fetch('/api/riot/verification/verify-ownership', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ game })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Success!
                if (autoCheckInterval) clearInterval(autoCheckInterval);
                setAutoCheckInterval(null);

                toast({
                    title: "✅ Account verified!",
                    description: `${data.account.gameName}#${data.account.tagLine} linked successfully`
                });

                // Refresh page or invalidate queries
                window.location.reload();
            } else {
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Verification failed",
                description: error.message
            });
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        await checkVerification();
        setIsVerifying(false);
    };

    const handleAutoCheck = () => {
        if (autoCheckInterval) {
            clearInterval(autoCheckInterval);
            setAutoCheckInterval(null);
            toast({ title: "Auto-check stopped" });
        } else {
            const interval = setInterval(checkVerification, 3000); // Check every 3 seconds
            setAutoCheckInterval(interval);
            toast({ title: "Auto-checking every 3 seconds..." });
        }
    };

    if (step === 'input') {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-500" />
                        <CardTitle>{title}</CardTitle>
                    </div>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="riotId">Riot ID</Label>
                        <Input
                            id="riotId"
                            placeholder="GameName#TAG (e.g., Faker#KR1)"
                            value={riotId}
                            onChange={(e) => setRiotId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRequestCode()}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select value={region} onValueChange={setRegion}>
                            <SelectTrigger id="region">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {regions.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleRequestCode}
                        disabled={isRequesting}
                        className="w-full"
                    >
                        {isRequesting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating code...
                            </>
                        ) : (
                            'Generate Verification Code'
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    <CardTitle>Verify Account Ownership</CardTitle>
                </div>
                <CardDescription>Add code to your in-game Riot ID to prove ownership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Verification Code Display */}
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Your Verification Code:</div>
                    <div className="flex items-center justify-between">
                        <code className="text-2xl font-mono text-orange-500 font-bold">
                            {verificationCode}
                        </code>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyCode}
                            className="ml-4"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
                    <div className="font-semibold text-white">How to verify:</div>
                    <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                        <li>Copy the verification code above</li>
                        <li>Open your {game === 'valorant' ? 'Valorant' : 'League of Legends'} client</li>
                        <li>Go to Settings → Riot ID</li>
                        <li>Add the code to your Riot ID (e.g., "YourName {verificationCode}#TAG")</li>
                        <li>Click "Verify Ownership" below</li>
                    </ol>
                    <div className="text-xs text-gray-500 mt-2">
                        ⏱️ Code expires in 10 minutes
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="flex-1"
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            '✓ Verify Ownership'
                        )}
                    </Button>

                    <Button
                        onClick={handleAutoCheck}
                        variant={autoCheckInterval ? "destructive" : "secondary"}
                        className="flex-1"
                    >
                        {autoCheckInterval ? '⏹ Stop Auto-Check' : '🔄 Auto-Check (3s)'}
                    </Button>
                </div>

                <Button
                    onClick={() => { setStep('input'); setVerificationCode(''); }}
                    variant="ghost"
                    className="w-full"
                >
                    ← Start Over
                </Button>
            </CardContent>
        </Card>
    );
}
