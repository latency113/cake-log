import React from 'react';
import { Outlet } from '@tanstack/react-router';
import OfficerSidebar from './OfficerSidebar';

const OfficerLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <OfficerSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default OfficerLayout;
