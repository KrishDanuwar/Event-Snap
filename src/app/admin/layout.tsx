'use client';

import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row font-sans text-neutral-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 shadow-sm flex flex-col pt-6 z-10">
        <div className="px-6 mb-8 flex items-center gap-2">
           <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold tracking-tighter text-sm">ES</span>
           </div>
           <span className="text-xl font-bold tracking-tight">EventSnap</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 text-sm font-medium">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-neutral-100 text-neutral-700">
            📊 Dashboard
          </Link>
          <Link href="/admin/events" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-neutral-100 text-neutral-700">
            🗓️ Events
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-neutral-100 text-neutral-700">
            ⚙️ Settings
          </Link>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100">
           <button 
             onClick={async () => {
                const { createBrowserClient } = await import('@/lib/supabase/client');
                const supabase = createBrowserClient();
                await supabase.auth.signOut();
                window.location.href = '/admin';
             }}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-50 font-semibold"
           >
             🚪 Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
