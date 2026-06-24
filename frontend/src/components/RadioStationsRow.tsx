"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { RadioStationMix } from "@/hooks/useRadioStations";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";
import { Play, ChevronLeft, ChevronRight, Radio, Sparkles, Flame, Compass, Music, Headphones, Zap } from "lucide-react";

interface RadioStationsRowProps {
  stations: RadioStationMix[];
}

const MixCoverRenderer = ({ station }: { station: RadioStationMix }) => {
  let Icon = Music;
  let text = station.title;
  let bgColor = station.bgColor || "#FFB703";
  
  if (station.type === 'dna') {
    Icon = Sparkles;
  } else if (station.type === 'today') {
    Icon = Zap;
  } else if (station.type === 'editor') {
    Icon = Sparkles;
  } else if (station.type === 'genre') {
    Icon = Flame;
  } else if (station.type === 'discovery') {
    Icon = Compass;
  } else if (station.type === 'artist') {
    Icon = Headphones;
  }

  return (
    <div 
      className="w-full h-full relative flex flex-col items-start justify-end p-4 overflow-hidden group-hover:scale-105 transition-transform duration-500"
      style={{ backgroundColor: bgColor }}
    >
      {/* Giant faint icon in the background for visual interest */}
      <Icon size={120} strokeWidth={1.5} className="absolute -top-4 -right-4 text-black opacity-10 -rotate-12" />
      
      {/* Normal icon at the top left */}
      <div className="absolute top-4 left-4 bg-black/20 p-1.5 rounded-full backdrop-blur-sm shadow-sm">
        <Icon size={16} className="text-white opacity-90" />
      </div>

      <span className="text-white font-bold text-lg md:text-xl leading-tight line-clamp-3 relative z-10 drop-shadow-md">
        {text}
      </span>
    </div>
  );
};

export function RadioStationsRow({ stations }: RadioStationsRowProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!stations || stations.length === 0) return null;

  return (
    <div className="mb-12 px-6 md:px-12 lg:px-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
          <Radio size={24} className="text-[#FFB703]" />
          Stations & Mixes
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {stations.map((station) => (
          <div 
            key={station.id}
            className="group relative flex-shrink-0 w-44 md:w-52 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer snap-start"
            onClick={() => router.push(`/dashboard/mix/${station.id}`)}
          >
            {/* Cover Design */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 shadow-md bg-gray-900">
              <MixCoverRenderer station={station} />
              
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors pointer-events-none" />

              {/* Play Button Overlay */}
              <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <button className="w-12 h-12 bg-[#FFB703] rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:scale-105 transition-transform">
                  <Play size={20} fill="#1A1A1A" color="#1A1A1A" className="ml-1" />
                </button>
              </div>
              
              {/* Type Badge */}
              <div className="absolute top-2 left-2 pointer-events-none">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Mix
                </span>
              </div>
            </div>

            {/* Meta */}
            <div>
              <h3 className="font-bold text-[#1A1A1A] text-base truncate mb-1">{station.title}</h3>
              <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                {station.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
