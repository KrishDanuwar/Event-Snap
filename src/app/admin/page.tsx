'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalEvents: 0, activeEvents: 0, totalGuests: 0, totalPhotos: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-10 animate-pulse">Loading core analytics...</div>;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Platform Overview</h1>
        <p className="text-neutral-500 text-lg">System-wide metrics and current usage.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="text-sm font-semibold text-neutral-500 mb-2">Total Events Created</div>
            <div className="text-4xl font-bold">{stats.totalEvents}</div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 border-l-4 border-l-red-500">
            <div className="text-sm font-semibold text-neutral-500 mb-2">Active Events Now</div>
            <div className="text-4xl font-bold text-red-600">{stats.activeEvents}</div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="text-sm font-semibold text-neutral-500 mb-2">Total Guests Joined</div>
            <div className="text-4xl font-bold">{stats.totalGuests}</div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 border-l-4 border-l-green-500">
            <div className="text-sm font-semibold text-neutral-500 mb-2">Total Photos Captured</div>
            <div className="text-4xl font-bold text-green-600">{stats.totalPhotos}</div>
         </div>

      </div>

      {/* Quick Actions */}
      <div className="pt-6">
         <h2 className="text-2xl font-bold tracking-tight mb-4">Quick Actions</h2>
         <Link href="/admin/events" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm">
            <span>➕</span>
            Create New Event
         </Link>
      </div>

    </div>
  );
}
