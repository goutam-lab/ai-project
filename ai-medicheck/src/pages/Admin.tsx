import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Bell,
  Package2,
  Users,
  LineChart,
  Package,
  Settings,
  Brain,
  Search,
  FlaskConical,
  ShieldAlert,
  FileText,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/apiService";

// --- Data Types from Backend ---

interface DashboardStats {
  total_users: number;
  total_products: number;
  total_alerts: number;
  active_sensors: number;
  system_uptime: string;
  // These are from the README example
  recent_audit_logs: AuditLog[];
  ai_models_status: AIModel[];
  system_metrics: {
    avg_cpu_usage: number;
    avg_memory_usage: number;
    total_api_calls: number;
  };
}

interface User {
  id: number;
  email: string;
  username: string;
  company_name: string;
  user_type: "admin" | "user";
  is_active: boolean;
  created_at: string;
}

interface AIModel {
  id: number;
  model_name: string;
  model_type: string;
  version: string;
  accuracy: number | null;
  status: string;
  last_trained: string | null;
}

interface Sensor {
  id: number;
  sensor_id: string;
  sensor_type: string;
  location: string;
  status: string;
  calibration_date: string | null;
}

interface CounterfeitReport {
  id: number;
  product_id: number;
  reporter_id: number;
  confidence_score: number;
  detection_method: string;
  status: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  table_name: string | null;
  record_id: number | null;
  ip_address: string | null;
  timestamp: string;
}

// --- Helper Functions ---

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

// --- Main Component ---

export function Admin() {
  const { user, token } = useAuth();
  
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [reports, setReports] = useState<CounterfeitReport[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);

  // Loading and Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if user is an admin
    if (user?.user_type === "admin") {
      const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch all data in parallel
          const [
            statsData,
            usersData,
            modelsData,
            sensorsData,
            reportsData,
            auditsData,
          ] = await Promise.all([
            api.get("/admin/dashboard/"),
            api.get("/admin/users/"),
            api.get("/admin/ai-models/"),
            api.get("/admin/sensors/"),
            api.get("/admin/counterfeit/reports"),
            api.get("/admin/system/audit-logs"),
          ]);

          setStats(statsData);
          setUsers(usersData);
          setModels(modelsData);
          setSensors(sensorsData);
          setReports(reportsData);
          setAudits(auditsData);

        } catch (err: any) {
          setError(err.message || "Failed to fetch admin data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllData();
    }
  }, [user]); // Re-run if user changes

  // --- Auth Check ---
  // If still loading auth, show skeleton
  if (!token && !user) {
    return <Skeleton className="h-screen w-full" />;
  }

  // If user is not an admin, redirect
  if (user?.user_type !== "admin") {
    return <Navigate to="/login" replace />;
  }
  
  // --- Render Error State ---
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // --- Render Main Content ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_users ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monitored Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_products ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.active_sensors ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_alerts ?? 0}</div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="counterfeit">Counterfeit</TabsTrigger>
            <TabsTrigger value="audits">Audit Logs</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.company_name}</TableCell>
                        <TableCell>
                          <Badge variant={user.user_type === "admin" ? "destructive" : "outline"}>
                            {user.user_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AI Models Tab */}
          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Trained</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell>{model.model_name}</TableCell>
                        <TableCell>{model.model_type}</TableCell>
                        <TableCell>{model.version}</TableCell>
                        <TableCell>
                          {model.accuracy ? `${model.accuracy.toFixed(2)}%` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={model.status === "active" ? "default" : "secondary"}>
                            {model.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(model.last_trained)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sensors Tab */}
          <TabsContent value="sensors">
            <Card>
              <CardHeader>
                <CardTitle>IoT Sensor Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sensor ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Calibrated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensors.map((sensor) => (
                      <TableRow key={sensor.id}>
                        <TableCell>{sensor.sensor_id}</TableCell>
                        <TableCell>{sensor.sensor_type}</TableCell>
                        <TableCell>{sensor.location}</TableCell>
                        <TableCell>
                          <Badge variant={sensor.status === "active" ? "default" : "secondary"}>
                            {sensor.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(sensor.calibration_date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Counterfeit Reports Tab */}
          <TabsContent value="counterfeit">
            <Card>
              <CardHeader>
                <CardTitle>Counterfeit Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.id}</TableCell>
                        <TableCell>{report.product_id}</TableCell>
                        <TableCell>{report.detection_method}</TableCell>
                        <TableCell>{report.confidence_score.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "pending" ? "outline" : "default"}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(report.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audits">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Log ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{log.user_id}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.table_name ?? "N/A"}</TableCell>
                        <TableCell>{log.ip_address ?? "N/A"}</TableCell>
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg. CPU Usage</CardDescription>
                      <CardTitle className="text-3xl">
                        {stats?.system_metrics?.avg_cpu_usage?.toFixed(1) ?? "N/A"}%
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg. Memory Usage</CardDescription>
                      <CardTitle className="text-3xl">
                        {stats?.system_metrics?.avg_memory_usage?.toFixed(1) ?? "N/A"}%
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>System Uptime</CardDescription>
                      <CardTitle className="text-3xl">
                        {stats?.system_uptime ?? "N/A"}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
                <Button variant="outline">Run System Health Check</Button>
                <Button variant="destructive">Trigger System Backup</Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}