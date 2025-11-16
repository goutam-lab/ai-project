import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  FileText,
  HelpCircle,
  Monitor
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    message: "",
    inquiry: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed responses within 24 hours",
      contact: "support@medimonitor.ai",
      action: "mailto:support@medimonitor.ai"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our experts directly",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Instant support during business hours",
      contact: "Available 9 AM - 6 PM PST",
      action: "#"
    }
  ];

  const officeLocations = [
    {
      city: "San Francisco",
      address: "123 Medical Tech Drive, Suite 400",
      zipcode: "San Francisco, CA 94105",
      phone: "+1 (555) 123-4567"
    },
    {
      city: "Boston", 
      address: "456 Pharma Innovation Blvd",
      zipcode: "Boston, MA 02118",
      phone: "+1 (555) 987-6543"
    },
    {
      city: "London",
      address: "789 Healthcare Center, Floor 12",
      zipcode: "London EC2M 4YE, UK", 
      phone: "+44 20 7123 4567"
    }
  ];

  const faqs = [
    {
      question: "How quickly can the system be deployed?",
      answer: "Our system can typically be deployed within 24-48 hours. This includes sensor installation, network setup, and initial configuration. Full training and optimization usually take an additional 1-2 weeks."
    },
    {
      question: "What are the hardware requirements?",
      answer: "Our IoT sensors are battery-powered and wireless, requiring no additional infrastructure. They connect via secure wireless protocols and have a 5+ year battery life. No servers or complex installations needed."
    },
    {
      question: "Is the system compliant with regulatory standards?",
      answer: "Yes, our platform meets FDA 21 CFR Part 11, EMA guidelines, and other international regulatory standards. We provide automated documentation and validation reports for compliance audits."
    },
    {
      question: "What is the accuracy of temperature monitoring?",
      answer: "Our medical-grade sensors provide ±0.1°C accuracy with real-time monitoring. The system includes redundant sensors and AI-powered calibration to ensure the highest precision."
    },
    {
      question: "Can the system integrate with existing workflows?",
      answer: "Absolutely. Our platform offers REST APIs, webhook notifications, and integrations with major pharmaceutical management systems. We work with your team to ensure seamless integration."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 technical support, regular system updates, training programs, and dedicated account management. Our team includes pharmaceutical compliance experts and technical specialists."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Contact 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {" "}Our Team
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to transform your pharmaceutical monitoring? Our experts are here to help you 
            implement AI-powered medicine safety solutions tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Send className="w-6 h-6 mr-3 text-primary" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-status-safe mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                    <p className="text-muted-foreground">
                      Your message has been sent successfully. We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Dr. Sarah Johnson"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="sarah@pharmatech.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="PharmaTech Industries"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Your Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quality-manager">Quality Manager</SelectItem>
                            <SelectItem value="compliance-officer">Compliance Officer</SelectItem>
                            <SelectItem value="it-director">IT Director</SelectItem>
                            <SelectItem value="operations-manager">Operations Manager</SelectItem>
                            <SelectItem value="ceo-executive">CEO/Executive</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiry">Type of Inquiry</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="What can we help you with?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Request Demo</SelectItem>
                          <SelectItem value="pricing">Pricing Information</SelectItem>
                          <SelectItem value="integration">Integration Support</SelectItem>
                          <SelectItem value="compliance">Regulatory Compliance</SelectItem>
                          <SelectItem value="technical">Technical Questions</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your pharmaceutical monitoring needs, current challenges, or specific questions about our AI platform..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-gradient-primary hover:shadow-medium">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      * Required fields. We typically respond within 24 hours.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Contact Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <a 
                    key={index}
                    href={method.action}
                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-muted/30 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <method.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{method.description}</p>
                      <p className="text-sm font-medium text-primary">{method.contact}</p>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span>10:00 AM - 4:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span>Closed</span>
                </div>
                <div className="pt-2 text-sm text-primary">
                  Emergency support: 24/7 for critical issues
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Office Locations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Global Offices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {officeLocations.map((office, index) => (
              <Card key={index} className="border-border/50 hover:shadow-medium transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <MapPin className="w-5 h-5 mr-2 text-primary" />
                    {office.city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">{office.address}</p>
                  <p className="text-muted-foreground">{office.zipcode}</p>
                  <div className="flex items-center space-x-2 pt-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{office.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Card className="border-border/50 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="w-6 h-6 mr-3 text-primary" />
                Common Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-primary text-white rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Let's discuss how MediMonitor AI can revolutionize your pharmaceutical monitoring operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              <Monitor className="w-4 h-4 mr-2" />
              View Demo
            </a>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <Users className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;