import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MediMonitor AI
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              AI-powered medicine quality and safety monitoring. Real-time IoT tracking, 
              AI predictions, and secure dashboards to ensure medicine authenticity and prevent spoilage.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contact@medimonitor.ai</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="block text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/admin" className="block text-muted-foreground hover:text-primary transition-colors">
                Admin Panel
              </Link>
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              <Link to="/how-it-works" className="block text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                API Documentation
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Support Center
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 MediMonitor AI. All rights reserved. Built for pharmaceutical excellence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;