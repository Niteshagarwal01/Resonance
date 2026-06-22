"use client";

import { AlertTriangle, Hammer, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // Use a small delay to ensure it pops up smoothly after initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] sm:w-auto max-w-lg pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-orange-200/50 shadow-2xl shadow-orange-500/10 rounded-2xl p-4 flex items-start gap-4 pointer-events-auto group">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-500 group-hover:scale-110 transition-transform">
              <Hammer size={20} className="animate-pulse" />
            </div>
            
            <div className="flex-1 pt-0.5 pr-4">
              <h4 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                Live Construction Zone
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              </h4>
              <p className="text-xs font-semibold text-gray-500 mt-1 leading-relaxed">
                We are actively building and shipping new features to Resonance right now. You might experience occasional bugs or layout shifts as the codebase evolves!
              </p>
            </div>

            <button 
              onClick={() => setIsVisible(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-400 hover:text-[#1A1A1A] transition-colors shrink-0"
              title="Dismiss"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
