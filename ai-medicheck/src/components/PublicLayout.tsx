import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PublicLayout() {
  const { pathname } = useLocation();

  // Check if this is an admin route
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hide navbar & footer for admin pages */}
      {!isAdminRoute && <Navigation />}

      <main className="flex-grow">
        <Outlet />
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}
