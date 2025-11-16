import { 
  Activity, 
  Brain, 
  Bell, 
  Monitor, 
  ArrowRight, 
  CheckCircle,
  Thermometer,
  Wifi,
  Database,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Sensor Deployment",
      icon: Activity,
      description: "IoT sensors are strategically placed throughout your storage facilities to monitor temperature, humidity, and environmental conditions in real-time.",
      features: ["Temperature monitoring (±0.1°C accuracy)", "Humidity tracking", "Wireless connectivity", "Battery life: 5+ years"],
      color: "primary"
    },
    {
      number: "02", 
      title: "Data Collection",
      icon: Wifi,
      description: "Sensors continuously collect environmental data and transmit it securely to our cloud infrastructure using encrypted protocols.",
      features: ["24/7 data streaming", "Encrypted transmission", "Real-time processing", "99.99% uptime guarantee"],
      color: "secondary"
    },
    {
      number: "03",
      title: "AI Analysis",
      icon: Brain,
      description: "Our advanced AI algorithms analyze the data streams, predict potential issues, and detect anomalies before they become critical problems.",
      features: ["Machine learning models", "Predictive analytics", "Anomaly detection", "99.7% accuracy rate"],
      color: "accent"
    },
    {
      number: "04",
      title: "Smart Alerts",
      icon: Bell,
      description: "When potential risks are identified, the system instantly sends alerts through multiple channels to ensure rapid response and intervention.",
      features: ["Instant notifications", "Multi-channel alerts", "Priority-based routing", "Escalation protocols"],
      color: "warning"
    },
    {
      number: "05",
      title: "Dashboard Monitoring",
      icon: Monitor,
      description: "Access comprehensive dashboards showing real-time status, historical trends, predictions, and actionable insights for your entire operation.",
      features: ["Real-time dashboards", "Historical analytics", "Compliance reports", "Mobile accessibility"],
      color: "success"
    },
    {
      number: "06",
      title: "Automated Response",
      icon: CheckCircle,
      description: "The system can automatically trigger responses like adjusting storage conditions or initiating emergency protocols to prevent medicine spoilage.",
      features: ["Automated controls", "Emergency protocols", "Regulatory compliance", "Quality assurance"],
      color: "medical"
    }
  ];

  const technicalSpecs = [
    { label: "Data Processing Speed", value: "< 100ms", description: "Real-time analysis and response" },
    { label: "Sensor Accuracy", value: "±0.1°C", description: "Medical-grade precision monitoring" },
    { label: "System Uptime", value: "99.99%", description: "Enterprise reliability guarantee" },
    { label: "Alert Response Time", value: "< 30 seconds", description: "Instant notification delivery" }
  ];

  const benefits = [
    { title: "Prevent Spoilage", description: "Reduce medicine waste by up to 85% through predictive monitoring" },
    { title: "Ensure Compliance", description: "Automated documentation for FDA, EMA, and global regulatory standards" },
    { title: "Improve Efficiency", description: "Optimize storage conditions and reduce operational costs" },
    { title: "Enhanced Safety", description: "Guarantee medicine authenticity and patient safety" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            How 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {" "}It Works
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover how our AI-powered medicine monitoring system protects pharmaceutical integrity 
            through intelligent sensors, predictive analytics, and automated response systems.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-12 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-${step.color} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                      {step.number}
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold">{step.title}</h2>
                      <div className="flex items-center space-x-2 mt-2">
                        <step.icon className={`w-5 h-5 text-${step.color}`} />
                        <Badge variant="outline" className={`text-${step.color} border-${step.color}`}>
                          Step {step.number}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-status-safe flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Illustration */}
                <Card className={`border-border/50 hover:shadow-medium transition-shadow ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <CardContent className="p-8">
                    <div className={`w-full h-48 bg-gradient-${step.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                      <step.icon className={`w-16 h-16 text-${step.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-8">
                  <ArrowRight className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Technical Specifications */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalSpecs.map((spec, index) => (
              <Card key={index} className="text-center border-border/50 hover:shadow-medium transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">{spec.value}</div>
                  <div className="text-lg font-semibold mb-2">{spec.label}</div>
                  <div className="text-sm text-muted-foreground">{spec.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group border-border/50 hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Integration Process */}
        <section className="mb-20 bg-gradient-hero rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-center mb-12">Easy Integration Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">1. Assessment</h3>
              <p className="text-muted-foreground">Our team evaluates your current infrastructure and monitoring needs.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-secondary rounded-xl flex items-center justify-center mx-auto">
                <Thermometer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">2. Installation</h3>
              <p className="text-muted-foreground">Quick sensor deployment and system configuration within 24 hours.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">3. Activation</h3>
              <p className="text-muted-foreground">Training your team and activating full monitoring capabilities.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-primary text-white rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Experience the future of pharmaceutical monitoring with our comprehensive demo dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              View Demo Dashboard
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Schedule Consultation
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;