import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Package,
  Bell,
  Package2,
  Settings,
  Search,
  Users,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/apiService";

// --- Data Types from Backend ---

interface UserDashboardStats {
  total_products: number;
  active_alerts: number;
  safe_products: number;
  quality_score_avg: number;
}

interface Product {
  id: number;
  name: string;
  batch_number: string;
  status: string;
  current_temperature: number | null;
  current_humidity: number | null;
  expiry_date: string;
}

interface Alert {
  id: number;
  product_id: number;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// --- Helper Functions ---

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const getInitials = (name: string = "User") => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// --- Main Component ---

export function Dashboard() {
  const { user, token } = useAuth();
  
  // Data states
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Loading and Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if user is logged in
    if (token) {
      const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch all data in parallel
          const [statsData, productsData, alertsData] = await Promise.all([
            api.get("/dashboard/"),
            api.get("/monitoring/products"),
            api.get("/alerts/"),
          ]);

          setStats(statsData);
          setProducts(productsData);
          setAlerts(alertsData);

        } catch (err: any) {
          setError(err.message || "Failed to fetch dashboard data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllData();
    }
  }, [token]); // Re-run if token changes

  // --- Auth Check ---
  // If still loading auth, show skeleton
  if (!token && !user) {
    return <Skeleton className="h-screen w-full" />;
  }

  // If user is not logged in, redirect
  if (!token) {
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="h-96 w-full lg:col-span-4" />
          <Skeleton className="h-96 w-full lg:col-span-3" />
        </div>
      </div>
    );
  }

  // --- Render Main Content ---
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_products ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Alerts
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.active_alerts ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Safe Products</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.safe_products ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Quality Score
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.quality_score_avg?.toFixed(1) ?? 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>My Products</CardTitle>
                <CardDescription>
                  Overview of all your monitored products.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link to="#">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Temp</TableHead>
                    <TableHead>Humidity</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Badge variant={product.status.includes("Safe") ? "default" : "destructive"}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.current_temperature?.toFixed(1) ?? 'N/A'}°C</TableCell>
                      <TableCell>{product.current_humidity?.toFixed(1) ?? 'N/A'}%</TableCell>
                      <TableCell>{product.batch_number}</TableCell>
                      <TableCell>{formatDate(product.expiry_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Recent alerts from your monitoring system.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              {alerts.slice(0, 5).map((alert) => ( // Show 5 most recent
                <div key={alert.id} className="flex items-center gap-4">
                  <Bell className="h-6 w-6 text-destructive" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {alert.alert_type.toUpperCase()} - {alert.severity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {formatDate(alert.created_at)}
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}