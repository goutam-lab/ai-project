import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

/**
 * This component provides a consistent layout for all public-facing pages.
 * It renders the main navigation, the page content (via <Outlet />),
 * and the footer.
 */
export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">
        {/* Outlet renders the child page (Index, About, Contact, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}