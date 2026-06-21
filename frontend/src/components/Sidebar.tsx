"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Dna, Library, Mic2, Users, User, Plus, Search, ListMusic, Heart } from "lucide-react";
import { Logo } from "./Logo";

const navLinks = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Library", href: "/dashboard/library", icon: Library },
  { name: "Queue", href: "/dashboard/queue", icon: ListMusic },
];

const secondaryLinks = [
  { name: "Discover", href: "/dashboard/discover", icon: Compass },
  { name: "Taste DNA", href: "/dashboard/taste-dna", icon: Dna },
  { name: "Artists", href: "/dashboard/artists", icon: Mic2 },
  { name: "Community", href: "/dashboard/community", icon: Users },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-64 h-full bg-[#FDFBF7] border-r border-[#1A1A1A]/5 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <Logo variant="horizontal" size={28} />
      </div>

      {/* Main nav */}
      <nav className="px-3 mb-2 shrink-0">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-bold mb-0.5 ${
                active
                  ? "bg-[#FFB703] text-[#1A1A1A] shadow-sm"
                  : "text-gray-600 hover:bg-black/5 hover:text-[#1A1A1A]"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Liked Songs shortcut */}
      <div className="px-3 mb-4 shrink-0">
        <Link
          href="/dashboard/library"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <Heart size={14} fill="currentColor" />
          </div>
          Liked Songs
        </Link>
      </div>

      <div className="mx-4 border-t border-gray-100 mb-4" />

      {/* Secondary nav */}
      <nav className="px-3 flex-1 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Explore</p>
        {secondaryLinks.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-semibold mb-0.5 ${
                active
                  ? "bg-[#FFB703] text-[#1A1A1A] shadow-sm"
                  : "text-gray-500 hover:bg-black/5 hover:text-[#1A1A1A]"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* New Playlist button */}
      <div className="px-3 pb-6 shrink-0 mt-2">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-[#1A1A1A] text-sm font-bold hover:shadow-md transition-all active:scale-95">
          <Plus size={18} strokeWidth={2.5} />
          New Playlist
        </button>
      </div>
    </aside>
  );
}
