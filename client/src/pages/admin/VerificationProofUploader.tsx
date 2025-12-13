import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Image, Video } from "lucide-react";

export default function VerificationProofUploader() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        sourceType: "match",
        sourceId: "",
        fileUrl: "",
        fileType: "",
        fileSizeBytes: 0,
        fileMetadata: {}
    });

    const uploadMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await fetch("/api/verification/submit-proof", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            });
            if (!response.ok) throw new Error("Failed to submit proof");
            return response.json();
        },
        onSuccess: () => {
            toast({ title: "Proof Submitted", description: "Verification proof uploaded successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/verification/stats"] });
            setFormData({ sourceType: "match", sourceId: "", fileUrl: "", fileType: "", fileSizeBytes: 0, fileMetadata: {} });
        },
        onError: (error: Error) => {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        }
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Submit Verification Proof
                    </CardTitle>
                    <CardDescription>
                        Upload proof of gameplay for verification
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="sourceType">Source Type</Label>
                        <select
                            id="sourceType"
                            className="w-full p-2 border rounded-md"
                            value={formData.sourceType}
                            onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                        >
                            <option value="match">Match</option>
                            <option value="stream">Stream</option>
                            <option value="challenge">Challenge</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sourceId">Source ID</Label>
                        <Input
                            id="sourceId"
                            placeholder="Match ID, Stream ID, etc."
                            value={formData.sourceId}
                            onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fileUrl">File URL</Label>
                        <Input
                            id="fileUrl"
                            placeholder="https://storage.example.com/proof.png"
                            value={formData.fileUrl}
                            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fileType">File Type</Label>
                            <select
                                id="fileType"
                                className="w-full p-2 border rounded-md"
                                value={formData.fileType}
                                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                            >
                                <option value="">Select type</option>
                                <option value="image/png">PNG Image</option>
                                <option value="image/jpeg">JPEG Image</option>
                                <option value="video/mp4">MP4 Video</option>
                                <option value="application/json">JSON Data</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fileSize">File Size (bytes)</Label>
                            <Input
                                id="fileSize"
                                type="number"
                                value={formData.fileSizeBytes}
                                onChange={(e) => setFormData({ ...formData, fileSizeBytes: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => uploadMutation.mutate(formData)}
                        disabled={uploadMutation.isPending || !formData.fileUrl}
                        className="w-full"
                    >
                        {uploadMutation.isPending ? "Uploading..." : "Submit Proof"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
