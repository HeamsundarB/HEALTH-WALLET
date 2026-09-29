import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Phase0Banner } from './Phase0Banner';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from '../../services/api';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: healthData, isError, isLoading } = useQuery({
    queryKey: ['backendHealth'],
    queryFn: fetchHealthStatus,
    retry: 1,
    refetchInterval: 30000,
  });

  const backendStatus = isLoading
    ? 'loading'
    : isError || !healthData || healthData.status !== 'ok'
    ? 'error'
    : 'ok';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Phase0Banner />
      <Navbar
        onMobileMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        backendStatus={backendStatus}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ healthData, backendStatus }} />
          </div>
        </main>
      </div>
    </div>
  );
};
