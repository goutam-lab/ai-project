// ai-medicheck/src/App.tsx

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// --- Layout Imports ---
import PublicLayout from "@/components/PublicLayout";
import AdminLayout from "@/components/AdminLayout";

// --- Public Page Imports ---
import Index from "@/pages/Index";
import About from "@/pages/About";
import HowItWorks from "@/pages/HowItWorks";
import Contact from "@/pages/Contact";

// --- Auth & App Page Imports ---
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import AdminDashboardPage from "@/pages/Admin"; 

// --- Admin Page Imports ---
import AdminUsers from "@/pages/AdminUsers";
import AdminProducts from "@/pages/AdminProducts";
import AdminSensors from "@/pages/AdminSensors";
import AdminModels from "@/pages/AdminModels";
import NotFound from "@/pages/NotFound"; 

// --- NEW: Import the Chatbot ---
import AIMedicineBot from "@/components/AIMedicineBot";

function AppRoutes() {
  return (
    <>
      {/* Render the Bot globally. 
         It will float on top of all other routes.
      */}
      <AIMedicineBot />

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
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="sensors" element={<AdminSensors />} />
          <Route path="models" element={<AdminModels />} />
        </Route>

        {/* --- Catch-all 404 Route --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
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