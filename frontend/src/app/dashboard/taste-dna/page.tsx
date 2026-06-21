"use client";

import { motion } from "framer-motion";
import { Activity, Disc3, Layers, Zap, Heart, RefreshCw, Sparkles, Compass } from "lucide-react";

export default function TasteDNAPage() {
  return (
    <div className="p-8 pb-32">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 flex items-center gap-4">
          Taste DNA <Activity className="text-[#FFB703]" size={40} />
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          The core of your Resonance. An evolving blueprint of your sonic identity, built from thousands of data points.
        </p>
      </div>

      {/* Primary DNA Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Vital 1 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
              <Zap size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Vibe</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#1A1A1A] mb-2">High Energy</h3>
            <p className="text-gray-500">Your recent listening peaks around 120 BPM. You thrive on momentum.</p>
          </div>
        </div>

        {/* Vital 2 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
              <Disc3 size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Era</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#1A1A1A] mb-2">Nostalgic 2010s</h3>
            <p className="text-gray-500">You&apos;re deeply anchored in the mid-2010s blog era, but frequently venture into modern hyperpop.</p>
          </div>
        </div>

        {/* Vital 3 */}
        <div className="bg-[#1A1A1A] p-8 rounded-3xl shadow-xl flex flex-col justify-between text-white relative overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FFB703] blur-[60px] opacity-20 rounded-full"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[#FFB703]">
              <Sparkles size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Top Match</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-2 text-[#FFB703]">Synthwave</h3>
            <p className="text-gray-400">Your #1 dominant micro-genre this week based on 42 tracks.</p>
          </div>
        </div>

      </div>

      {/* DNA Breakdown Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Core Genres */}
        <div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
            <Layers size={24} className="text-indigo-500"/> Core Pillars
          </h2>
          <div className="space-y-4">
            {[
              { name: "Indie Pop", pct: 45, color: "bg-indigo-500" },
              { name: "Electronic", pct: 28, color: "bg-blue-500" },
              { name: "Alternative R&B", pct: 15, color: "bg-pink-500" },
              { name: "Acoustic Folk", pct: 12, color: "bg-orange-400" },
            ].map((genre) => (
              <div key={genre.name} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <span className="font-bold text-gray-400 w-12 text-right">{genre.pct}%</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${genre.pct}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${genre.color}`}
                  />
                </div>
                <span className="font-bold text-[#1A1A1A] w-32">{genre.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Listening Habits */}
        <div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
            <RefreshCw size={24} className="text-green-500"/> Listening Habits
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="bg-green-50 p-4 rounded-2xl text-green-600">
                <Heart size={28} fill="currentColor"/>
              </div>
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-1">Loyalty Rate</h4>
                <p className="text-2xl font-black text-[#1A1A1A]">82%</p>
                <p className="text-sm text-gray-500">You rarely skip your favorite tracks.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
                <Compass size={28}/>
              </div>
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-1">Discovery Engine</h4>
                <p className="text-2xl font-black text-[#1A1A1A]">18% New Music</p>
                <p className="text-sm text-gray-500">You are a creature of habit this week.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
