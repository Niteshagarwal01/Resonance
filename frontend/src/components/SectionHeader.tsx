import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeader({ title, icon, showMoreUrl }: { title: string, icon: React.ReactNode, showMoreUrl?: string }) {
  const PX = "px-6 md:px-12 lg:px-20";
  return (
    <div className={`flex items-center justify-between mb-4 ${PX}`}>
      <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {showMoreUrl && (
        <Link href={showMoreUrl} className="text-xs font-bold text-gray-400 hover:text-[#1A1A1A] transition-colors flex items-center uppercase tracking-wider">
          View All <ChevronRight size={14} className="ml-0.5" />
        </Link>
      )}
    </div>
  );
}
