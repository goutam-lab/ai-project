import { Link } from "react-router-dom";
import { Shield, Activity, AlertTriangle, TrendingUp, Users, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-medical.jpg";

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "Real-time Monitoring",
      description: "24/7 IoT sensor tracking of temperature, humidity, and storage conditions with instant alerts."
    },
    {
      icon: Activity,
      title: "AI Predictions",
      description: "Machine learning algorithms predict spoilage risks and shelf life with 99.7% accuracy."
    },
    {
      icon: AlertTriangle,
      title: "Smart Anomaly Detection",
      description: "Advanced AI detects counterfeit packaging and quality deviations before they become critical."
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast medicine quality trends and optimize storage conditions for maximum shelf life."
    },
    {
      icon: Users,
      title: "Regulatory Compliance", 
      description: "Automated reporting and documentation that meets FDA, EMA, and global regulatory standards."
    },
    {
      icon: Clock,
      title: "Instant Alerts",
      description: "Real-time notifications via SMS, email, and dashboard alerts for critical conditions."
    }
  ];

  const stats = [
    { value: "99.7%", label: "Prediction Accuracy" },
    { value: "24/7", label: "Real-time Monitoring" },
    { value: "50+", label: "Pharmaceutical Partners" },
    { value: "2.5M", label: "Medicines Tracked" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-28 lg:pt-32 lg:pb-40 bg-gradient-hero overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                AI-Powered Medicine
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {" "}Quality & Safety{" "}
                </span>
                Monitoring
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Real-time IoT tracking, AI predictions, and secure dashboards to ensure 
                medicine authenticity and prevent spoilage across your entire supply chain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/dashboard">
                  <Button size="lg" className="group bg-gradient-primary hover:shadow-large transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
                    View Demo Dashboard
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto transition-all duration-300 transform hover:-translate-y-1">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in group">
              <div className="absolute -inset-2 bg-gradient-primary rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
              <img 
                src={heroImage} 
                alt="AI-powered medicine monitoring dashboard interface"
                className="relative rounded-2xl shadow-large w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-5 -right-5 bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-medium border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-status-safe rounded-full animate-pulse-glow"></div>
                  <span className="text-sm font-semibold">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/50 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-lg hover:bg-background transition-colors duration-300 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              A Comprehensive Monitoring Platform
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform provides end-to-end monitoring solutions for pharmaceutical 
              companies, distributors, and regulatory bodies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-large transition-all duration-300 border-border/50 overflow-hidden transform hover:-translate-y-2">
                <CardHeader className="p-6">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-card p-10 lg:p-16 rounded-2xl shadow-medium border border-border/50">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your Medicine Monitoring?
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join leading pharmaceutical companies using our AI platform to ensure 
              medicine quality and regulatory compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-primary hover:shadow-large transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
                  Start Demo
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto transition-all duration-300 transform hover:-translate-y-1">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;