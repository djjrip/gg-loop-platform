import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Ban, RefreshCw, Shield } from "lucide-react";

interface Violation {
  id: number;
  userId: number;
  username: string;
  alertType: string;
  severity: string;
  description: string;
  metadata: any;
  createdAt: string;
  resolvedAt: string | null;
}

export default function AdminAntiCheat() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadViolations();
  }, [page]);

  const loadViolations = async () => {
    try {
      const res = await fetch(`/api/anticheat/violations?page=${page}&limit=50`);
      const data = await res.json();
      setViolations(data.violations);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load violations:", err);
      setLoading(false);
    }
  };

  const resetCooldown = async (userId: number) => {
    if (!confirm("Reset cooldowns for this user?")) return;
    
    try {
      await fetch(`/api/anticheat/reset/${userId}`, { method: "POST" });
      alert("Cooldowns reset successfully");
      loadViolations();
    } catch (err) {
      alert("Failed to reset cooldowns");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-500";
      case "HIGH": return "bg-orange-500";
      case "MEDIUM": return "bg-yellow-500";
      case "LOW": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Anti-Cheat Dashboard</h1>
        <Button onClick={loadViolations} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {violations.filter(v => v.severity === "CRITICAL").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {violations.filter(v => v.severity === "HIGH").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">ON</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {violations.map((violation) => (
              <div
                key={violation.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getSeverityColor(violation.severity)}>
                      {violation.severity}
                    </Badge>
                    <span className="font-semibold">{violation.username}</span>
                    <span className="text-sm text-muted-foreground">
                      {violation.alertType}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {violation.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(violation.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetCooldown(violation.userId)}
                  >
                    Reset Cooldown
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              variant="outline"
            >
              Previous
            </Button>
            <span>Page {page}</span>
            <Button
              disabled={violations.length < 50}
              onClick={() => setPage(p => p + 1)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
