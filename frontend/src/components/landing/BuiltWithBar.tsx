"use client";

import { motion } from "framer-motion";

export function BuiltWithBar() {
  return (
    <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto flex items-center" style={{ height: 64, gap: 48 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.2)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, flexShrink: 0, whiteSpace: "nowrap" }}>Built with</p>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
        <div className="flex items-center gap-10 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { name: "YouTube Music", color: "#f87171" },
            { name: "Supabase", color: "#22c55e" },
            { name: "FastAPI", color: "#818cf8" },
            { name: "Next.js 15", color: "rgba(255,255,255,0.9)" },
            { name: "Python", color: "#FFB703" },
            { name: "ytmusicapi", color: "#a3e4b0" },
          ].map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: tech.color }} />
              <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>{tech.name}</span>
            </motion.div>
          ))}
        </div>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
        <div className="flex items-center gap-2 flex-shrink-0">
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>v1.0.0 · MIT License</span>
        </div>
      </div>
    </div>
  )
}
