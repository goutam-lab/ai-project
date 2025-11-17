// Replace the code in ai-medicheck/src/pages/Admin.tsx with this:

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Package,
  Users2,
  AlertTriangle,
  Thermometer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/apiService";

// (Keep the interface types: AdminDashboardStats, User, Product)
// (Keep the helper functions: formatDate, getInitials)
// ... (Your interfaces and helpers go here) ...

interface AdminDashboardStats {
  total_users: number;
  total_products: number;
  total_alerts: number;
  total_sensors: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  user_type: "user" | "admin";
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  batch_number: string;
  status: string;
  owner_id: number;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  
  // Data states
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Loading and Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user?.user_type === "admin") {
      const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [statsData, usersData, productsData] = await Promise.all([
            api.get("/admin/dashboard/"),
            api.get("/admin/users/"),
            api.get("/admin/products/"),
          ]);

          setStats(statsData);
          setUsers(usersData);
          setProducts(productsData);

        } catch (err: any) {
          setError(err.message || "Failed to fetch admin data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllData();
    }
  }, [token, user]);

  // --- Auth Checks ---
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!user) {
    return <Skeleton className="h-screen w-full" />;
  }
  if (user?.user_type !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 lg:gap-6">
        <Skeleton className="h-20 w-full" />
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

  // --- Render Error State ---
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // --- Render Main Dashboard Content ---
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Admin Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_alerts ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_sensors ?? 0}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.user_type === 'admin' ? 'destructive' : 'outline'}>
                        {user.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.slice(0, 5).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.batch_number}</TableCell>
                    <TableCell>
                      <Badge variant={product.status.includes("Safe") ? "default" : "destructive"}>
                        {product.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// NOTE: All AdminSidebar and AdminHeader functions have been removed
// They now live in AdminLayout.tsx