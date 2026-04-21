'use client';

import { useEffect, useState } from 'react';
import { Camera, Users, HardDrive, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalPhotos: number;
    totalGuests: number;
    estimatedStorageMB: string;
  };
  timeline: Array<{ time: string; count: number }>;
}

export default function AdminAnalytics({ eventId }: { eventId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/admin/events/${eventId}/analytics`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [eventId]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
       {[1,2,3].map(i => <div key={i} className="h-32 bg-neutral-100 rounded-3xl" />)}
    </div>
  );

  if (!data) return null;

  const maxCount = Math.max(...data.timeline.map(t => t.count), 1);

  return (
    <div className="space-y-8 animate-fade-in">
       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Camera size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Photos</p>
                <p className="text-2xl font-black">{data.summary.totalPhotos}</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Users size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Guests</p>
                <p className="text-2xl font-black">{data.summary.totalGuests}</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <HardDrive size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Storage Used</p>
                <p className="text-2xl font-black">{data.summary.estimatedStorageMB} MB</p>
             </div>
          </div>
       </div>

       {/* Timeline Chart */}
       <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                   <TrendingUp size={20} className="text-green-500" />
                   Activity Timeline
                </h3>
                <p className="text-sm text-neutral-400">Photo uploads bucketed by hour</p>
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                <Clock size={14} />
                Live Updates
             </div>
          </div>

          <div className="h-64 flex items-end gap-2 overflow-x-auto pb-4 custom-scrollbar">
             {data.timeline.length > 0 ? (
                data.timeline.map((point, i) => (
                   <div key={i} className="flex-1 min-w-[30px] flex flex-col items-center group relative">
                      <div 
                        className="w-full bg-blue-500/10 rounded-t-lg transition-all group-hover:bg-blue-500/30"
                        style={{ height: `${(point.count / maxCount) * 100}%` }}
                      >
                         <div 
                           className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                         >
                            {point.count} photos @ {new Date(point.time).getHours()}:00
                         </div>
                      </div>
                      <span className="text-[8px] font-bold text-neutral-300 mt-2 rotate-45 origin-left">
                         {new Date(point.time).getHours()}:00
                      </span>
                   </div>
                ))
             ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-300 font-bold italic">
                   No activity data yet...
                </div>
             )}
          </div>
       </div>

       {/* Pro Tip */}
       <div className="bg-neutral-900 text-white p-6 rounded-3xl flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
             <TrendingUp size={32} className="text-blue-400" />
          </div>
          <div>
             <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">Insight</p>
             <p className="text-neutral-300 text-sm leading-relaxed">
                Your event had the highest engagement at <strong>{data.timeline.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), {time: 'N/A', count: 0}).time.slice(11, 16)}</strong>. 
                Consider sending a "Thank You" notification to guests during peak times!
             </p>
          </div>
       </div>
    </div>
  );
}
