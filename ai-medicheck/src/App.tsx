// Replace the code in ai-medicheck/src/App.tsx with this:

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// --- Layout Imports ---
import PublicLayout from "@/components/PublicLayout"; // (Create this if you don't have it)
import AdminLayout from "@/components/AdminLayout"; // <-- NEW

// --- Public Page Imports ---
import Index from "@/pages/Index";
import About from "@/pages/About";
import HowItWorks from "@/pages/HowItWorks";
import Contact from "@/pages/Contact";

// --- Auth & App Page Imports ---
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import AdminDashboardPage from "@/pages/Admin"; // <-- Renamed for clarity
import NotFound from "@/pages/NotFound";

// --- Admin Page Imports ---
import AdminUsers from "@/pages/AdminUsers";
import AdminProducts from "@/pages/AdminProducts";
import AdminSensors from "@/pages/AdminSensors";
import AdminModels from "@/pages/AdminModels";
// (You can create and import AdminAlerts and AdminLogs here too)

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
      {/* This is the new nested layout route.
        The <AdminLayout> component (with sidebar/header) is rendered,
        and then the <Outlet /> inside it renders one of the child routes.
      */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} /> {/* Renders at /admin */}
        <Route path="users" element={<AdminUsers />} /> {/* Renders at /admin/users */}
        <Route path="products" element={<AdminProducts />} /> {/* Renders at /admin/products */}
        <Route path="sensors" element={<AdminSensors />} /> {/* Renders at /admin/sensors */}
        <Route path="models" element={<AdminModels />} /> {/* Renders at /admin/models */}
        {/* <Route path="alerts" element={<AdminAlerts />} /> */}
        {/* <Route path="logs" element={<AdminLogs />} /> */}
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

/*
NOTE: If you don't have a PublicLayout.tsx, you can create it
or just keep your old public route structure. The important
part is the new <Route path="/admin" element={<AdminLayout />}>
with its child routes.
*/