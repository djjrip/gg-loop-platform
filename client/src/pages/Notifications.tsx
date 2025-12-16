import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Info, ShieldAlert, Gift } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
       const res = await fetch("/api/notifications");
       if (!res.ok) throw new Error("Failed");
       return res.json();
    }
  });

  const markReadMutation = useMutation({
     mutationFn: async (ids: number[]) => {
         await fetch("/api/notifications/mark-read", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ ids })
         });
     },
     onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
     }
  });

  // Auto-mark as read on open (optional, or manual)
  // For now, let's just show them.

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const getIcon = (type: string) => {
      switch(type) {
          case 'security': return <ShieldAlert className="text-red-500" />;
          case 'reward': return <Gift className="text-ggloop-orange" />;
          case 'partner': return <Info className="text-blue-500" />;
          default: return <Bell className="text-gray-400" />;
      }
  };

  const handleMarkAllRead = () => {
      if (notifications) {
          markReadMutation.mutate(notifications.map((n: any) => n.id));
      }
  };

  return (
    <div className="min-h-screen bg-black pb-24 pt-4 px-4 md:px-0">
       <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Bell className="fill-white text-white" /> Inbox
              </h1>
              {unreadCount > 0 && <Button size="sm" variant="ghost" onClick={handleMarkAllRead}>Mark all read</Button>}
          </div>

          <div className="space-y-3">
             {isLoading && <div className="text-gray-500 text-center py-8">Loading updates...</div>}
             
             {notifications && notifications.length === 0 && (
                 <div className="text-center py-12 border border-white/10 rounded-xl bg-zinc-900/50">
                     <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Check className="text-green-500 w-8 h-8" />
                     </div>
                     <h3 className="text-white font-bold mb-1">All Caught Up</h3>
                     <p className="text-gray-500">No new notifications.</p>
                 </div>
             )}

             {notifications?.map((n: any) => (
                 <Card key={n.id} className={`border-white/10 bg-zinc-900 overflow-hidden ${!n.isRead ? 'border-ggloop-orange/50' : ''}`}>
                    <CardContent className="p-4 flex gap-4">
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-white font-bold ${!n.isRead ? 'text-ggloop-orange' : ''}`}>{n.title}</h4>
                                <span className="text-xs text-gray-500">{format(new Date(n.createdAt), "MMM d, h:mm a")}</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{n.message}</p>
                            {n.metadata?.actionUrl && (
                                <a href={n.metadata.actionUrl} className="text-xs font-bold text-blue-500 hover:underline uppercase tracking-wide">
                                    {n.metadata.actionText || "View Details"} &rarr;
                                </a>
                            )}
                        </div>
                        {!n.isRead && <div className="w-2 h-2 bg-ggloop-orange rounded-full mt-2" />}
                    </CardContent>
                 </Card>
             ))}
          </div>
       </div>
    </div>
  );
}
