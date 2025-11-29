import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, FileText } from "lucide-react";
import Header from "@/components/Header";

export default function AuditLogs() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ["/api/admin/audit-logs"],
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto p-8">
                <div className="mb-8 flex items-center gap-4">
                    <FileText className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Audit Logs</h1>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Admin ID</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Target ID</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.map((log: any) => (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{log.adminId}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{log.targetId || "-"}</TableCell>
                                    <TableCell className="max-w-md truncate font-mono text-xs text-muted-foreground">
                                        {JSON.stringify(log.details)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {logs?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No audit logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    );
}
