'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.refresh(); // Middleware will redirect to /admin (login)
  };

  if (isLoading) return <div className="p-10 animate-pulse">Loading Account Settings...</div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-neutral-500 text-lg">Manage your administrative access.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 space-y-6">
        
        <section>
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Current Administrator</h3>
          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
             <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.email?.[0].toUpperCase()}
             </div>
             <div>
                <div className="font-bold">{user?.email}</div>
                <div className="text-xs text-neutral-400">Authenticated via Supabase Auth</div>
             </div>
          </div>
        </section>

        <section className="pt-6 border-t border-neutral-100 space-y-4">
           <div>
              <h3 className="font-bold text-lg">Platform Management</h3>
              <p className="text-sm text-neutral-500">Sign out of the administrative dashboard on this device.</p>
           </div>
           <button 
              onClick={handleSignOut}
              className="px-6 py-3 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
           >
              Sign Out
           </button>
        </section>

      </div>

      <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex gap-4">
         <span className="text-2xl">🛡️</span>
         <div>
            <h4 className="font-bold text-red-800">Security Note</h4>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
               Security settings like Password Reset and Multi-Factor Authentication are managed directly within your 
               Supabase Project Dashboard. For enterprise-grade access control, please visit your 
               authenticated project environment.
            </p>
         </div>
      </div>

    </div>
  );
}
