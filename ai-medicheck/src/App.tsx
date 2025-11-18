// ai-medicheck/src/App.tsx

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// --- Layout Imports ---
import PublicLayout from "@/components/PublicLayout";
import AdminLayout from "@/components/AdminLayout"; // <-- Admin layout

// --- Public Page Imports ---
import Index from "@/pages/Index";
import About from "@/pages/About";
import HowItWorks from "@/pages/HowItWorks";
import Contact from "@/pages/Contact";

// --- Auth & App Page Imports ---
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import AdminDashboardPage from "@/pages/Admin"; // <-- Renamed for clarity

// --- Admin Page Imports ---
import AdminUsers from "@/pages/AdminUsers";
import AdminProducts from "@/pages/AdminProducts";
import AdminSensors from "@/pages/AdminSensors";
import AdminModels from "@/pages/AdminModels";
import NotFound from "@/pages/NotFound"; // (Assuming you have this)

function AppRoutes() {
  return (
    <Routes>
      {/* --- Public Routes (with Nav/Footer) --- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* --- Auth/App Routes (no main Nav/Footer) --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* --- ADMIN ROUTES --- */}
      {/* This renders the AdminLayout, and the <Outlet />
        inside it renders one of the child routes.
      */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} /> {/* Renders at /admin */}
        <Route path="users" element={<AdminUsers />} /> {/* Renders at /admin/users */}
        <Route path="products" element={<AdminProducts />} /> {/* Renders at /admin/products */}
        <Route path="sensors" element={<AdminSensors />} /> {/* Renders at /admin/sensors */}
        <Route path="models" element={<AdminModels />} /> {/* Renders at /admin/models */}
      </Route>

      {/* --- Catch-all 404 Route --- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/**
 * Main App Component
 * Wraps the entire application in the AuthProvider.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}