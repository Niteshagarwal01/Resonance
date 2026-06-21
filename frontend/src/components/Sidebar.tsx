"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Dna, Library, Mic2, Users, User, Plus, Search } from "lucide-react";
import { Logo } from "./Logo";

const navLinks = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Discover", href: "/dashboard/discover", icon: Compass },
  { name: "Taste DNA", href: "/dashboard/taste-dna", icon: Dna },
  { name: "Library", href: "/dashboard/library", icon: Library },
  { name: "Artists", href: "/dashboard/artists", icon: Mic2 },
  { name: "Community", href: "/dashboard/community", icon: Users },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-[#FDFBF7] border-r border-[#1A1A1A]/5 flex flex-col pt-6 pb-24">
      <div className="px-6 mb-8">
        <Logo variant="horizontal" size={28} />
      </div>

      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FFB703] focus:ring-1 focus:ring-[#FFB703] transition-all"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-hide">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
                isActive 
                  ? "bg-[#FFB703] text-[#1A1A1A] shadow-sm" 
                  : "text-gray-600 hover:bg-black/5 hover:text-[#1A1A1A]"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-gray-200 text-[#1A1A1A] text-sm font-bold hover:shadow-md transition-all active:scale-95">
          <Plus size={18} strokeWidth={2.5} />
          New Playlist
        </button>
      </div>
    </aside>
  );
}
