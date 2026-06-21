"use client";

import { UserCircle, Settings, Edit3, Shield, CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      }
    }
    loadProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push("/login");
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast('Settings saved successfully!');
      setTimeout(() => setToast(''), 3000);
    }, 1000);
  };

  return (
    <div className="p-8 pb-32 max-w-4xl mx-auto">
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16">
        <div className="w-40 h-40 bg-gray-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-gray-400 relative overflow-hidden shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={80} strokeWidth={1} />
          )}
          <button className="absolute bottom-0 w-full bg-black/50 text-white text-xs font-bold py-2 opacity-0 hover:opacity-100 transition-opacity">
            Change Photo
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <span className="bg-[#FFB703]/10 text-[#FFB703] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">Pro Member</span>
          <h1 className="text-5xl font-black text-[#1A1A1A] mb-2">
            {profile?.display_name || "Guest Listener"}
          </h1>
          <p className="text-gray-500 font-medium">
            Age Group: {profile?.age_range || "Unknown"} • 12 Followers • 48 Following
          </p>
        </div>

        <button className="bg-white border border-gray-200 text-[#1A1A1A] font-bold px-6 py-3 rounded-full shadow-sm hover:border-[#1A1A1A] transition-colors flex items-center gap-2">
          <Edit3 size={18} /> Edit Profile
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div 
          onClick={() => setActiveTab('settings')}
          className={`bg-white p-6 rounded-3xl border shadow-sm cursor-pointer transition-colors ${activeTab === 'settings' ? 'border-[#FFB703] ring-2 ring-[#FFB703]/20' : 'border-gray-100 hover:border-[#FFB703]'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${activeTab === 'settings' ? 'bg-[#FFB703] text-white' : 'bg-gray-50 text-gray-600'}`}>
            <Settings size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Account Settings</h3>
          <p className="text-sm text-gray-500">Manage your email, password, and active sessions.</p>
        </div>

        <div 
          onClick={() => setActiveTab('privacy')}
          className={`bg-white p-6 rounded-3xl border shadow-sm cursor-pointer transition-colors ${activeTab === 'privacy' ? 'border-[#FFB703] ring-2 ring-[#FFB703]/20' : 'border-gray-100 hover:border-[#FFB703]'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${activeTab === 'privacy' ? 'bg-[#FFB703] text-white' : 'bg-gray-50 text-gray-600'}`}>
            <Shield size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Privacy</h3>
          <p className="text-sm text-gray-500">Control who sees your Taste DNA and listening activity.</p>
        </div>

        <div 
          onClick={() => setActiveTab('subscription')}
          className={`bg-white p-6 rounded-3xl border shadow-sm cursor-pointer transition-colors ${activeTab === 'subscription' ? 'border-[#FFB703] ring-2 ring-[#FFB703]/20' : 'border-gray-100 hover:border-[#FFB703]'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${activeTab === 'subscription' ? 'bg-[#FFB703] text-white' : 'bg-gray-50 text-gray-600'}`}>
            <CreditCard size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Subscription</h3>
          <p className="text-sm text-gray-500">You are currently on the Resonance Pro plan.</p>
        </div>

        {/* Logout Button */}
        <div 
          onClick={handleLogout}
          className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm cursor-pointer hover:border-red-300 transition-colors group"
        >
          <div className="w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LogOut size={20} />
          </div>
          <h3 className="text-lg font-bold text-red-600 mb-1">Log Out</h3>
          <p className="text-sm text-red-400">Clear your local session and return to login.</p>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab && (
        <div className="mt-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-[#1A1A1A] capitalize">{activeTab} Details</h2>
            <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-[#1A1A1A]">Close</button>
          </div>
          
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
                <input type="text" defaultValue={profile?.display_name || ''} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFB703]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input type="email" defaultValue={profile?.email || ''} disabled className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#FFB703]" />
                <span className="font-medium text-[#1A1A1A]">Make my Taste DNA public</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#FFB703]" />
                <span className="font-medium text-[#1A1A1A]">Show my active listening sessions to followers</span>
              </label>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl">
              <h4 className="text-xl font-bold mb-2 text-[#FFB703]">Resonance Pro</h4>
              <p className="text-gray-300 mb-4">Your next billing date is Oct 14, 2024.</p>
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Manage Billing via Stripe</button>
            </div>
          )}

          <div className="mt-8 flex justify-end items-center gap-4">
            {toast && <span className="text-emerald-500 font-bold text-sm">{toast}</span>}
            {activeTab !== 'subscription' && (
              <button 
                onClick={handleSave} 
                className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-bold hover:bg-[#FFB703] hover:text-[#1A1A1A] transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
