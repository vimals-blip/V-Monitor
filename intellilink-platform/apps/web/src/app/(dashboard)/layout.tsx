'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { TopBar } from '../../components/layout/TopBar';
import { isAuthenticated } from '../../lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F17] flex">
      <AppSidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 mt-16 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
