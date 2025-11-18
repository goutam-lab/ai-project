import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, Shield, Users, Info, Phone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // 🚀 FIX: DO NOT SHOW NAVBAR FOR ANY ADMIN ROUTE
  if (location.pathname.startsWith("/admin")) {
    return null;   // <-- This single line solves your double navbar issue permanently
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Activity },
    { href: "/dashboard", label: "Dashboard", icon: Shield },
    { href: "/admin", label: "Admin", icon: Settings },
    { href: "/about", label: "About", icon: Info },
    { href: "/how-it-works", label: "How It Works", icon: Users },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MediMonitor AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} to={href}>
                <Button
                  variant={location.pathname === href ? "secondary" : "ghost"}
                  size="sm"
                  className="text-sm"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 animate-slide-in">
            <div className="space-y-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} to={href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={location.pathname === href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
