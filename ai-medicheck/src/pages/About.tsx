import { Shield, Target, Users, Award, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Enhanced Safety",
      description: "Reduce medicine spoilage by 85% through predictive monitoring and early intervention."
    },
    {
      icon: TrendingUp,
      title: "Improved Efficiency",
      description: "Optimize storage conditions and reduce waste with AI-powered predictions."
    },
    {
      icon: Award,
      title: "Regulatory Compliance",
      description: "Automated documentation ensures adherence to FDA, EMA, and global standards."
    },
    {
      icon: Users,
      title: "Better Patient Outcomes",
      description: "Ensure medicine authenticity and effectiveness reaches every patient."
    }
  ];

  const achievements = [
    { metric: "99.7%", label: "Prediction Accuracy", description: "Industry-leading AI model performance" },
    { metric: "50+", label: "Pharmaceutical Partners", description: "Trusted by leading companies globally" },
    { metric: "2.5M", label: "Medicines Monitored", description: "Real-time tracking across supply chains" },
    { metric: "85%", label: "Waste Reduction", description: "Average decrease in spoilage incidents" }
  ];

  const features = [
    "Real-time IoT sensor monitoring",
    "AI-powered predictive analytics", 
    "Smart anomaly detection",
    "Automated regulatory reporting",
    "Multi-platform dashboard access",
    "24/7 alert notifications",
    "Batch lifecycle tracking",
    "Temperature and humidity control"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            About 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {" "}MediMonitor AI
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing pharmaceutical supply chain monitoring through advanced AI technology, 
            ensuring medicine quality and safety from production to patient delivery.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="border-border/50 hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To ensure every medicine reaches patients in optimal condition through intelligent monitoring, 
                AI-powered predictions, and comprehensive quality assurance systems that prevent spoilage 
                and maintain pharmaceutical integrity throughout the supply chain.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-medium transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To become the global standard for pharmaceutical monitoring, creating a world where 
                medicine spoilage is eliminated through predictive technology, enabling healthcare 
                providers to deliver safe, effective treatments to every patient worldwide.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Statistics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Proven Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center border-border/50 hover:shadow-medium transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">{achievement.metric}</div>
                  <div className="text-lg font-semibold mb-2">{achievement.label}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MediMonitor AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group border-border/50 hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <benefit.icon className="w-6 h-6 text-white" />
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

        {/* Features List */}
        <section className="mb-16">
          <div className="bg-gradient-hero rounded-2xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-status-safe flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Advanced Technology Stack</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:shadow-medium transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">AI & Machine Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">TensorFlow</Badge>
                  <Badge variant="secondary">PyTorch</Badge>
                  <Badge variant="secondary">Predictive Models</Badge>
                  <Badge variant="secondary">Anomaly Detection</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Advanced machine learning algorithms for accurate prediction and real-time anomaly detection.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-medium transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">IoT & Sensors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Temperature Sensors</Badge>
                  <Badge variant="secondary">Humidity Monitors</Badge>
                  <Badge variant="secondary">RFID Tracking</Badge>
                  <Badge variant="secondary">Wireless Networks</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Enterprise-grade IoT sensors providing 24/7 monitoring with millisecond precision.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-medium transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Cloud Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">AWS</Badge>
                  <Badge variant="secondary">Real-time Processing</Badge>
                  <Badge variant="secondary">Secure APIs</Badge>
                  <Badge variant="secondary">Global CDN</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Scalable cloud infrastructure ensuring 99.99% uptime and global accessibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-primary text-white rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Operations?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the pharmaceutical companies already benefiting from our AI-powered monitoring platform.
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
              Contact Our Team
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;