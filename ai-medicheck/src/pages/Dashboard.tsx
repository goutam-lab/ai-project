import { useState, useEffect } from "react";
import { 
  Thermometer, 
  Droplets, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Bell,
  FileText,
  Users,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  getDemoSensorReading, 
  getDemoAlerts, 
  getDemoTemperatureHistory, 
  getDemoShelfLifeData, 
  getDemoRecentActivity,
  startDemoDataRefresh,
  stopDemoDataRefresh
} from "@/lib/demoData";

const Dashboard = () => {
  const [sensorData, setSensorData] = useState(() => getDemoSensorReading());
  const [alerts] = useState(() => getDemoAlerts().slice(0, 3)); // Show latest 3 alerts
  const [temperatureData] = useState(() => getDemoTemperatureHistory());
  const [shelfLifeData] = useState(() => getDemoShelfLifeData());
  const [recentActivity] = useState(() => getDemoRecentActivity().slice(0, 4)); // Show latest 4 activities

  // Simulate real-time updates
  useEffect(() => {
    const intervalId = startDemoDataRefresh(() => {
      setSensorData(getDemoSensorReading());
    }, 3000); // Update every 3 seconds

    return () => stopDemoDataRefresh(intervalId);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "status-safe";
      case "warning": return "status-warning"; 
      case "critical": return "status-critical";
      default: return "muted";
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "critical": return "destructive";
      case "warning": return "secondary";
      default: return "outline";
    }
  };

  const getStorageCondition = (status: string) => {
    switch (status) {
      case "optimal": return "Optimal";
      case "warning": return "Warning";
      case "critical": return "Critical";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Medicine Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Real-time pharmaceutical quality and safety monitoring</p>
        </div>

        {/* Alert Banner */}
        {alerts.filter(alert => alert.type === 'critical').length > 0 && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-pulse-glow">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">Critical Alert</span>
              <span className="text-destructive/80">- Immediate attention required</span>
            </div>
          </div>
        )}

        {/* Real-time Monitoring Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 hover:shadow-medium transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Thermometer className="w-5 h-5 mr-2 text-primary" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{sensorData.temperature}°C</div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-${getStatusColor(sensorData.status)}`}></div>
                <span className="text-sm text-muted-foreground">Target: 2-8°C</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-medium transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Droplets className="w-5 h-5 mr-2 text-accent" />
                Humidity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{sensorData.humidity}%</div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-${getStatusColor(sensorData.status)}`}></div>
                <span className="text-sm text-muted-foreground">Target: 40-60%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-medium transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-secondary" />
                Storage Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{getStorageCondition(sensorData.status)}</div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-status-safe" />
                <span className="text-sm text-muted-foreground">All systems operational</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Predictions & Alerts */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                AI Predictions & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-secondary">Smart Anomaly Detection</span>
                    <Badge variant="outline" className="text-secondary border-secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">AI model monitoring 1,247 medicine batches with 99.7% accuracy</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Alerts</h4>
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-4 h-4 ${alert.type === 'critical' ? 'text-destructive' : alert.type === 'warning' ? 'text-warning' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleTimeString()} ago</p>
                        </div>
                      </div>
                      <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Request Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Configure Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Temperature Trends (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--secondary))" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Shelf Life Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={shelfLifeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="remaining" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary) / 0.3)" />
                  <Area type="monotone" dataKey="predicted" stackId="2" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.3)" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;