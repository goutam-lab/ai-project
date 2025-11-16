// Demo data generation and simulation for the medicine monitoring system

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  status: 'optimal' | 'warning' | 'critical';
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  batchId?: string;
  sensorId?: string;
  resolved: boolean;
}

export interface BatchInfo {
  id: string;
  name: string;
  medicine: string;
  manufacturingDate: Date;
  expiryDate: Date;
  currentShelfLife: number;
  predictedShelfLife: number;
  status: 'safe' | 'warning' | 'critical';
  storageLocation: string;
}

export interface SystemMetric {
  timestamp: Date;
  cpu: number;
  memory: number;
  diskUsage: number;
  activeSensors: number;
  alertsToday: number;
}

class DemoDataGenerator {
  private lastTemperature = 4.2;
  private lastHumidity = 45;
  private alertCounter = 0;

  // Generate realistic temperature reading with slight variations
  generateTemperature(): number {
    // Add some random walk behavior to make it realistic
    const change = (Math.random() - 0.5) * 0.4; // ±0.2°C change
    this.lastTemperature += change;
    
    // Keep within reasonable bounds (2-8°C optimal range with some variation)
    this.lastTemperature = Math.max(1.5, Math.min(9.0, this.lastTemperature));
    
    return Math.round(this.lastTemperature * 10) / 10;
  }

  // Generate realistic humidity reading
  generateHumidity(): number {
    const change = (Math.random() - 0.5) * 6; // ±3% change
    this.lastHumidity += change;
    
    // Keep within bounds (30-70% with 40-60% being optimal)
    this.lastHumidity = Math.max(25, Math.min(75, this.lastHumidity));
    
    return Math.round(this.lastHumidity);
  }

  // Determine status based on readings
  getStatus(temperature: number, humidity: number): 'optimal' | 'warning' | 'critical' {
    const tempOutOfRange = temperature < 2 || temperature > 8;
    const humidityOutOfRange = humidity < 40 || humidity > 60;
    
    if (tempOutOfRange || humidityOutOfRange) {
      // 20% chance of critical, 80% chance of warning
      return Math.random() < 0.2 ? 'critical' : 'warning';
    }
    
    // 95% chance of optimal when in range
    return Math.random() < 0.95 ? 'optimal' : 'warning';
  }

  // Generate current sensor reading
  generateCurrentReading(): SensorReading {
    const temperature = this.generateTemperature();
    const humidity = this.generateHumidity();
    const status = this.getStatus(temperature, humidity);

    return {
      id: `reading-${Date.now()}`,
      sensorId: 'TEMP-001',
      timestamp: new Date(),
      temperature,
      humidity,
      status
    };
  }

  // Generate batch information
  generateBatches(): BatchInfo[] {
    const medicines = [
      'Amoxicillin 500mg',
      'Insulin Vial Type-A',
      'Vaccine Batch Alpha',
      'Paracetamol 650mg',
      'Antibiotic Suspension',
      'COVID-19 Vaccine',
      'Insulin Pen',
      'Analgesic Tablets'
    ];

    return Array.from({ length: 8 }, (_, i) => {
      const manufacturingDate = new Date();
      manufacturingDate.setDate(manufacturingDate.getDate() - Math.random() * 180);
      
      const expiryDate = new Date(manufacturingDate);
      expiryDate.setDate(expiryDate.getDate() + 365 + Math.random() * 365);
      
      const currentShelfLife = Math.round(60 + Math.random() * 40); // 60-100%
      const predictedShelfLife = Math.round(currentShelfLife - Math.random() * 15); // Slightly lower prediction
      
      return {
        id: `BX2024-${String(i + 1).padStart(3, '0')}`,
        name: `Batch #BX2024-${String(i + 1).padStart(3, '0')}`,
        medicine: medicines[i],
        manufacturingDate,
        expiryDate,
        currentShelfLife,
        predictedShelfLife,
        status: currentShelfLife > 80 ? 'safe' : currentShelfLife > 60 ? 'warning' : 'critical',
        storageLocation: `Warehouse ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`
      };
    });
  }

  // Generate alerts
  generateAlerts(): Alert[] {
    const alertMessages = [
      {
        type: 'warning' as const,
        template: 'Batch #{batchId}: Humidity spike detected in {location}',
        batchId: 'BX2024-001'
      },
      {
        type: 'critical' as const,
        template: 'Storage Unit A3: Temperature out of range - immediate attention required',
        sensorId: 'TEMP-002'
      },
      {
        type: 'info' as const,
        template: 'AI Model updated: Prediction accuracy improved to 99.7%',
      },
      {
        type: 'warning' as const,
        template: 'Batch #{batchId}: Predicted shelf life decreased by 5%',
        batchId: 'BX2024-003'
      },
      {
        type: 'critical' as const,
        template: 'Counterfeit packaging anomaly detected in Warehouse B',
      },
      {
        type: 'info' as const,
        template: 'Sensor network: All 247 sensors reporting normally',
      }
    ];

    return alertMessages.map((alert, index) => ({
      id: `alert-${index + 1}`,
      type: alert.type,
      message: alert.template.replace('{batchId}', alert.batchId || 'BX2024-XXX')
                            .replace('{location}', 'Warehouse A'),
      timestamp: new Date(Date.now() - Math.random() * 3600000), // Within last hour
      batchId: alert.batchId,
      sensorId: alert.sensorId,
      resolved: Math.random() > 0.3 // 70% chance of being resolved
    }));
  }

  // Generate historical temperature data for charts
  generateTemperatureHistory(): Array<{ time: string; temp: number; predicted: number }> {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseTemp = 4.0 + Math.sin(i / 4) * 0.5 + Math.random() * 0.4;
      const predicted = baseTemp + (Math.random() - 0.5) * 0.2;
      
      data.push({
        time: time.getHours().toString().padStart(2, '0') + ':00',
        temp: Math.round(baseTemp * 10) / 10,
        predicted: Math.round(predicted * 10) / 10
      });
    }
    
    return data;
  }

  // Generate shelf life prediction data
  generateShelfLifeData(): Array<{ day: string; remaining: number; predicted: number }> {
    const data = [];
    
    for (let i = 0; i <= 30; i += 5) {
      const remaining = Math.max(55, 100 - i * 1.5 - Math.random() * 5);
      const predicted = remaining - Math.random() * 8;
      
      data.push({
        day: `Day ${i + 1}`,
        remaining: Math.round(remaining),
        predicted: Math.round(Math.max(50, predicted))
      });
    }
    
    return data;
  }

  // Generate system metrics for admin dashboard
  generateSystemMetrics(): SystemMetric[] {
    const metrics = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Simulate daily patterns (higher usage during business hours)
      const hour = timestamp.getHours();
      const businessHourMultiplier = hour >= 8 && hour <= 18 ? 1.5 : 0.7;
      
      metrics.push({
        timestamp,
        cpu: Math.round(30 + Math.random() * 40 * businessHourMultiplier),
        memory: Math.round(45 + Math.random() * 30 * businessHourMultiplier),
        diskUsage: Math.round(75 + Math.random() * 10),
        activeSensors: 247 - Math.floor(Math.random() * 5), // Occasional sensor offline
        alertsToday: Math.floor(Math.random() * 15) + 3
      });
    }
    
    return metrics;
  }

  // Generate recent activity for dashboard
  generateRecentActivity(): Array<{ action: string; time: string; user: string }> {
    const activities = [
      { action: "Temperature threshold updated for Batch #BX2024-003", user: "System" },
      { action: "Quality inspection completed for Storage Unit B2", user: "Dr. Smith" },
      { action: "New batch registered: #BX2024-008", user: "Admin" },
      { action: "AI anomaly detection activated for Warehouse C", user: "System" },
      { action: "Sensor calibration completed - TEMP-005", user: "Tech Support" },
      { action: "Alert acknowledged: High humidity in Zone A", user: "Dr. Johnson" },
      { action: "Compliance report generated for December", user: "System" },
      { action: "User access granted: mike.chen@pharma.com", user: "Admin" }
    ];

    return activities.map((activity, index) => ({
      ...activity,
      time: `${Math.floor(Math.random() * 120) + 10} mins ago`
    }));
  }

  // Format system metrics for charts
  formatSystemMetricsForChart(): Array<{ time: string; cpu: number; memory: number; disk: number }> {
    const metrics = this.generateSystemMetrics();
    
    return metrics.slice(-7).map(metric => ({
      time: metric.timestamp.getHours().toString().padStart(2, '0') + ':00',
      cpu: metric.cpu,
      memory: metric.memory,
      disk: metric.diskUsage
    }));
  }
}

// Export singleton instance
export const demoDataGenerator = new DemoDataGenerator();

// Export utility functions for easy access
export const getDemoSensorReading = () => demoDataGenerator.generateCurrentReading();
export const getDemoBatches = () => demoDataGenerator.generateBatches();
export const getDemoAlerts = () => demoDataGenerator.generateAlerts();
export const getDemoTemperatureHistory = () => demoDataGenerator.generateTemperatureHistory();
export const getDemoShelfLifeData = () => demoDataGenerator.generateShelfLifeData();
export const getDemoSystemMetrics = () => demoDataGenerator.generateSystemMetrics();
export const getDemoRecentActivity = () => demoDataGenerator.generateRecentActivity();
export const getDemoSystemMetricsChart = () => demoDataGenerator.formatSystemMetricsForChart();

// Export demo data refresh function for real-time updates
export const startDemoDataRefresh = (callback: () => void, interval: number = 3000) => {
  return setInterval(callback, interval);
};

export const stopDemoDataRefresh = (intervalId: NodeJS.Timeout) => {
  clearInterval(intervalId);
};
