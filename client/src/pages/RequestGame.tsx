import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { ArrowLeft, Gamepad2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    gameName: z.string().min(2, "Game name is required"),
    platform: z.string().default("PC"),
    notes: z.string().optional(),
});

export default function RequestGame() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            gameName: "",
            platform: "PC",
            notes: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/requests/games", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to submit request");

            toast({
                title: "Request Received",
                description: `Thanks! We've noted your interest in ${values.gameName}.`,
            });

            // Brief delay then redirect to dashboard
            setTimeout(() => setLocation("/"), 1500);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <Button
                    variant="ghost"
                    className="pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => setLocation("/")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gradient">
                        Request a Game
                    </h1>
                    <p className="text-muted-foreground">
                        Tell us what to support next. We prioritize based on demand.
                    </p>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gamepad2 className="h-5 w-5 text-primary" />
                            Game Details
                        </CardTitle>
                        <CardDescription>
                            Which game are you playing?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="gameName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Game Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Apex Legends" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="platform"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Platform</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select platform" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PC">PC</SelectItem>
                                                    <SelectItem value="Console">Console</SelectItem>
                                                    <SelectItem value="Mobile">Mobile</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Any specific mode or feature?"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        "Sending..."
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Request
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
