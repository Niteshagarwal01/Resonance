"use client";

import { UserCircle, Settings, Edit3, Shield, CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);

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
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm cursor-pointer hover:border-[#FFB703] transition-colors">
          <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mb-4">
            <Settings size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Account Settings</h3>
          <p className="text-sm text-gray-500">Manage your email, password, and active sessions.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm cursor-pointer hover:border-[#FFB703] transition-colors">
          <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mb-4">
            <Shield size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Privacy</h3>
          <p className="text-sm text-gray-500">Control who sees your Taste DNA and listening activity.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm cursor-pointer hover:border-[#FFB703] transition-colors">
          <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mb-4">
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
    </div>
  );
}
