import React from 'react';
import { Outlet } from '@tanstack/react-router';
import AdminSidebar from './AdminSidebar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground"> {/* Add flex container */}
      <AdminSidebar /> {/* Include AdminSidebar */}
      <main className="flex-1 p-6"> {/* Wrap Outlet in main for content */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
