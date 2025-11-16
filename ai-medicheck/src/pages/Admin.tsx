import { useState } from "react";
import { 
  Settings, 
  Users, 
  FileText, 
  Activity, 
  Server,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Admin = () => {
  const [sensors] = useState([
    { id: "TEMP-001", name: "Storage Unit A1", type: "Temperature", status: "Active", location: "Warehouse A", lastReading: "4.2°C" },
    { id: "HUM-001", name: "Storage Unit A1", type: "Humidity", status: "Active", location: "Warehouse A", lastReading: "45%" },
    { id: "TEMP-002", name: "Storage Unit B2", type: "Temperature", status: "Warning", location: "Warehouse B", lastReading: "8.1°C" },
    { id: "HUM-002", name: "Storage Unit B2", type: "Humidity", status: "Active", location: "Warehouse B", lastReading: "52%" }
  ]);

  const [users] = useState([
    { id: 1, name: "Dr. Sarah Johnson", email: "sarah.johnson@pharma.com", role: "Quality Manager", status: "Active", lastLogin: "2 hours ago" },
    { id: 2, name: "Mike Chen", email: "mike.chen@pharma.com", role: "System Admin", status: "Active", lastLogin: "30 mins ago" },
    { id: 3, name: "Dr. Amanda Rodriguez", email: "amanda.r@pharma.com", role: "Compliance Officer", status: "Active", lastLogin: "1 day ago" },
    { id: 4, name: "James Wilson", email: "james.wilson@pharma.com", role: "Operator", status: "Inactive", lastLogin: "5 days ago" }
  ]);

  const [systemLogs] = useState([
    { timestamp: "2024-01-15 14:30:22", level: "INFO", source: "AI Engine", message: "Model training completed successfully" },
    { timestamp: "2024-01-15 14:25:15", level: "WARNING", source: "Sensor Network", message: "Sensor TEMP-002 reporting high values" },
    { timestamp: "2024-01-15 14:20:08", level: "INFO", source: "User Management", message: "User login: sarah.johnson@pharma.com" },
    { timestamp: "2024-01-15 14:15:33", level: "ERROR", source: "Database", message: "Connection timeout resolved" },
    { timestamp: "2024-01-15 14:10:44", level: "INFO", source: "Alert System", message: "Alert notification sent to 3 users" }
  ]);

  const systemMetrics = [
    { time: '00:00', cpu: 45, memory: 62, disk: 78 },
    { time: '04:00', cpu: 52, memory: 58, disk: 78 },
    { time: '08:00', cpu: 68, memory: 71, disk: 79 },
    { time: '12:00', cpu: 75, memory: 82, disk: 80 },
    { time: '16:00', cpu: 58, memory: 67, disk: 81 },
    { time: '20:00', cpu: 43, memory: 55, disk: 82 },
    { time: '24:00', cpu: 38, memory: 48, disk: 82 }
  ];

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "default";
      case "warning": return "secondary";
      case "inactive": 
      case "error": return "destructive";
      default: return "outline";
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "ERROR": return "text-destructive";
      case "WARNING": return "text-warning";
      case "INFO": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Administration</h1>
          <p className="text-muted-foreground">Manage sensors, users, and system configuration</p>
        </div>

        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="control" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Control Panel</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>System Logs</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span>System Metrics</span>
            </TabsTrigger>
          </TabsList>

          {/* Control Panel */}
          <TabsContent value="control" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sensor Management */}
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary" />
                      Sensor Management
                    </CardTitle>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sensor
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sensors.map(sensor => (
                      <div key={sensor.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium">{sensor.name}</div>
                          <div className="text-sm text-muted-foreground">{sensor.id} • {sensor.type}</div>
                          <div className="text-xs text-muted-foreground">{sensor.location} • {sensor.lastReading}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusVariant(sensor.status)}>
                            {sensor.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alert Thresholds */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Alert Thresholds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="temp-min">Temperature Range (°C)</Label>
                    <div className="flex space-x-2">
                      <Input id="temp-min" placeholder="Min" value="2" />
                      <Input id="temp-max" placeholder="Max" value="8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="humidity-min">Humidity Range (%)</Label>
                    <div className="flex space-x-2">
                      <Input id="humidity-min" placeholder="Min" value="40" />
                      <Input id="humidity-max" placeholder="Max" value="60" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-alerts" defaultChecked />
                    <Label htmlFor="auto-alerts">Enable automatic alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="ai-predictions" defaultChecked />
                    <Label htmlFor="ai-predictions">Enable AI predictions</Label>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border/50 hover:shadow-medium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Generate FDA/EMA compliance documentation</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last generated: 2 days ago</span>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-medium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Quality Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Weekly medicine quality analysis report</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last generated: 1 week ago</span>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-medium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Sensor Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Monthly sensor accuracy and uptime report</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last generated: 3 days ago</span>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-medium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Alert Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Analysis of system alerts and responses</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last generated: 1 day ago</span>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-medium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Batch Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Complete batch lifecycle tracking report</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last generated: 5 hours ago</span>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-medium transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Custom Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Create custom reports with specific parameters</p>
                  <div className="flex justify-between items-center">
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Logs */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>System Logs</CardTitle>
                  <div className="flex space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="error">Errors</SelectItem>
                        <SelectItem value="warning">Warnings</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  {systemLogs.map((log, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded border-l-4 border-l-muted">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground">{log.timestamp}</span>
                          <Badge variant="outline" className={getLogLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                          <span className="text-primary">{log.source}</span>
                        </div>
                      </div>
                      <div className="mt-1 text-foreground">{log.message}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Metrics */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Server Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-status-safe mb-2">Excellent</div>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Active Sensors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">247</div>
                  <p className="text-sm text-muted-foreground">3 sensors in warning state</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Data Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">1.2M</div>
                  <p className="text-sm text-muted-foreground">Records processed today</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>System Performance (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
                    <Area type="monotone" dataKey="memory" stackId="2" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary) / 0.3)" />
                    <Area type="monotone" dataKey="disk" stackId="3" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.3)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span>CPU Usage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span>Memory Usage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span>Disk Usage</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;