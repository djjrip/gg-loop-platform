import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ClipboardList, Users, Star, Link as LinkIcon,
    CheckCircle, XCircle, ExternalLink, Mail, Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for now - will connect to real API later
const MOCK_VIP_USERS = [
    { id: 1, name: "TopGamer99", email: "gamer@test.com", points: 15000, status: "Influencer" },
    { id: 2, name: "StreamQueen", email: "queen@test.com", points: 25000, status: "Partner" },
];

const MOCK_PENDING_FULFILLMENT = [
    { id: "ord_123", user: "Jayson Quindao", item: "Riot Points $10", date: "2024-11-27", status: "pending" },
    { id: "ord_124", user: "Alex Smith", item: "Steam Card $20", date: "2024-11-26", status: "pending" },
];

export default function FounderHub() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("fulfillment");
    const [notes, setNotes] = useState("");

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        toast({ title: "Copied!", description: "Link copied to clipboard" });
    };

    return (
        <>
            <Header />
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
                            Founder's Hub
                        </h1>
                        <p className="text-muted-foreground">Your personal command center for GG Loop</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.open('https://analytics.google.com', '_blank')}>
                            Analytics
                        </Button>
                        <Button onClick={() => window.open('https://discord.gg/ggloop', '_blank')}>
                            Discord Community
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto">
                        <TabsTrigger value="fulfillment" className="py-3">
                            <Gift className="mr-2 h-4 w-4" />
                            Fulfillment Queue
                            <Badge variant="destructive" className="ml-2">2</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="vips" className="py-3">
                            <Users className="mr-2 h-4 w-4" />
                            VIP Network
                        </TabsTrigger>
                        <TabsTrigger value="outreach" className="py-3">
                            <Mail className="mr-2 h-4 w-4" />
                            Outreach & Growth
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="py-3">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Founder Notes
                        </TabsTrigger>
                    </TabsList>

                    {/* FULFILLMENT TAB */}
                    <TabsContent value="fulfillment">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Rewards</CardTitle>
                                <CardDescription>
                                    Items that users have redeemed. You need to buy these manually and email them.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {MOCK_PENDING_FULFILLMENT.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Gift className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{order.item}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        For: <span className="font-medium text-foreground">{order.user}</span> • {order.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline">View Details</Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Mark Sent
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {MOCK_PENDING_FULFILLMENT.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No pending orders! 🎉
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* VIP NETWORK TAB */}
                    <TabsContent value="vips">
                        <Card>
                            <CardHeader>
                                <CardTitle>VIP & Influencer Rolodex</CardTitle>
                                <CardDescription>Track key people who can help GG Loop grow</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {MOCK_VIP_USERS.map((vip) => (
                                        <div key={vip.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                    <Star className="h-5 w-5 text-purple-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{vip.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{vip.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary">{vip.status}</Badge>
                                                <span className="text-sm font-mono">{vip.points.toLocaleString()} pts</span>
                                                <Button size="sm" variant="ghost">Edit</Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button className="w-full mt-4" variant="outline">
                                        + Add New Contact
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* OUTREACH TAB */}
                    <TabsContent value="outreach">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Links</CardTitle>
                                    <CardDescription>Important URLs to share</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                                        <div>
                                            <p className="font-medium text-sm">Main Site</p>
                                            <p className="text-xs text-muted-foreground">https://ggloop.io</p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => handleCopyLink("https://ggloop.io")}>
                                            <LinkIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                                        <div>
                                            <p className="font-medium text-sm">Referral Landing</p>
                                            <p className="text-xs text-muted-foreground">https://ggloop.io/refer</p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => handleCopyLink("https://ggloop.io/refer")}>
                                            <LinkIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                                        <div>
                                            <p className="font-medium text-sm">Discord Invite</p>
                                            <p className="text-xs text-muted-foreground">https://discord.gg/ggloop</p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => handleCopyLink("https://discord.gg/ggloop")}>
                                            <LinkIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Growth Checklist (Free)</CardTitle>
                                    <CardDescription>Daily tasks to get users</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-2">
                                            <input type="checkbox" className="h-4 w-4" />
                                            <span className="text-sm">Post daily highlight on TikTok</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <input type="checkbox" className="h-4 w-4" />
                                            <span className="text-sm">Reply to 5 tweets about gaming</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <input type="checkbox" className="h-4 w-4" />
                                            <span className="text-sm">Welcome new Discord members</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <input type="checkbox" className="h-4 w-4" />
                                            <span className="text-sm">Email 1 small streamer for partnership</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* NOTES TAB */}
                    <TabsContent value="notes">
                        <Card>
                            <CardHeader>
                                <CardTitle>Scratchpad</CardTitle>
                                <CardDescription>Keep track of your ideas here</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <textarea
                                    className="w-full h-64 p-4 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Type your ideas, to-do lists, or draft emails here..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={() => toast({ title: "Saved", description: "Notes saved locally" })}>
                                        Save Notes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
