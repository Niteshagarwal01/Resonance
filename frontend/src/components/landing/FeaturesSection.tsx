"use client";

import { motion } from "framer-motion";
import { Zap, BarChart3, Music, Users, Globe, Star } from "lucide-react";
import { BentoCard } from "../LandingUI";

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6 overflow-hidden">
      <div className="blob-orange absolute w-[600px] h-[600px] opacity-40" style={{ top: "-80px", right: "-100px" }} />
      <div className="dot-grid absolute inset-0 opacity-35 pointer-events-none" />
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
        <defs><pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M 80 0 L 0 0 0 80" fill="none" stroke="#1A1A1A" strokeWidth="1" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16"
        >
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#bbb", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px" }}>CORE FEATURES</p>
            <h2 style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1, margin: 0 }}>
              Every feature.<br />Zero compromises.
            </h2>
          </div>
          <p style={{ fontSize: 18, fontWeight: 500, color: "#777", maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
            We didn&apos;t reinvent music apps. We removed every paywall and plugged the world&apos;s most powerful catalog.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-5 auto-rows-auto">
          <BentoCard className="md:col-span-4" delay={0.05} style={{ background: "#1A1A1A", minHeight: 340, padding: "48px 48px" }}>
            <div style={{ position: "absolute", top: -100, right: -100, width: 340, height: 340, borderRadius: "50%", background: "rgba(139,92,246,0.2)", filter: "blur(60px)" }} />
            <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(59,130,246,0.15)", filter: "blur(50px)" }} />
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
              <Zap size={28} color="#FFB703" />
            </div>
            <h3 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.04em", color: "white", margin: "0 0 14px" }}>Infinite Auto-Play</h3>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, margin: "0 0 28px", maxWidth: 380 }}>
              We interface directly with YouTube Music&apos;s recommendation neural network — the same engine powering their billion-user platform.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Smart Queue", "Radio Mode", "Taste Matching", "Mood Detection"].map(t => (
                <span key={t} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.55)", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 800 }}>{t}</span>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2" delay={0.1} style={{ background: "white", border: "1px solid #f0f0f0", padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", minHeight: 340 }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,183,3,0.1)" }} />
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "#FFF9EB", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(255,183,3,0.15)" }}>
              <BarChart3 size={28} color="#FFB703" />
            </div>
            <motion.h3 whileHover={{ letterSpacing: "-0.02em" }} transition={{ duration: 0.25 }} style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 10px" }}>Taste DNA</motion.h3>
            <p style={{ fontSize: 14, color: "#999", lineHeight: 1.75, margin: "0 0 20px" }}>Every track builds your unique acoustic fingerprint. Share it. Discover people on your wavelength.</p>
            <div className="flex items-end gap-1.5" style={{ height: 52 }}>
              {[40, 65, 45, 80, 60, 90, 55, 70, 48, 85].map((h, i) => (
                <motion.div key={i} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 0.05 * i, duration: 0.5 }}
                  style={{ flex: 1, height: `${h}%`, background: i % 3 === 0 ? "#FFB703" : i % 3 === 1 ? "#818cf8" : "#a3e4b0", borderRadius: "3px 3px 0 0", transformOrigin: "bottom" }}
                />
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2" delay={0.15} style={{ background: "#F4F6FF", border: "1px solid #e0e5ff", padding: "36px 32px" }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 4px 16px rgba(99,102,241,0.12)" }}>
              <Music size={28} color="#818cf8" />
            </div>
            <motion.h3 whileHover={{ letterSpacing: "-0.02em" }} transition={{ duration: 0.25 }} style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 10px" }}>Smart Playlists</motion.h3>
            <p style={{ fontSize: 14, color: "#6366aa", lineHeight: 1.75, margin: "0 0 20px" }}>Create, save and sync playlists via Supabase. Like, dislike, shuffle. Every control open-sourced.</p>
            {["Levitating", "Blinding Lights", "Flowers"].map((s, i) => (
              <motion.div key={s} whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-3 mb-2"
                style={{ background: "white", borderRadius: 10, padding: "8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer" }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: ["#FFB703", "#818cf8", "#a3e4b0"][i] }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{s}</span>
              </motion.div>
            ))}
          </BentoCard>

          <BentoCard className="md:col-span-4" delay={0.2} style={{ background: "#F0FBF4", border: "1px solid #c0eecf", padding: "40px 40px" }}>
            <div style={{ position: "absolute", bottom: -40, right: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(100,220,150,0.18)", filter: "blur(50px)" }} />
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 4px 16px rgba(100,200,130,0.12)" }}>
              <Users size={28} color="#22c55e" />
            </div>
            <motion.h3 whileHover={{ letterSpacing: "-0.02em" }} transition={{ duration: 0.25 }} style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 10px" }}>The Global Queue</motion.h3>
            <p style={{ fontSize: 15, color: "#3d6649", lineHeight: 1.75, margin: "0 0 24px", maxWidth: 460 }}>A live community feed powered by Supabase. See what the world is listening to right now. Clone any queue instantly.</p>
            <div className="flex flex-wrap gap-3">
              {[
                { user: "alex_r", song: "started Levitating radio", color: "#FFB703" },
                { user: "sarah_m", song: "cloned The Weeknd queue", color: "#818cf8" },
                { user: "david_k", song: "liked 3 tracks", color: "#f87171" },
              ].map((ev, i) => (
                <motion.div key={i} whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} transition={{ type: "spring", stiffness: 300 }}
                  style={{ background: "white", borderRadius: 12, padding: "9px 14px", display: "flex", alignItems: "center", gap: 9, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer" }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: ev.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}><strong style={{ color: "#1A1A1A" }}>@{ev.user}</strong> {ev.song}</span>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2" delay={0.25} style={{ background: "#111", border: "none", padding: "36px 32px", minHeight: 220 }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,183,3,0.15)", filter: "blur(40px)" }} />
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
              <Globe size={26} color="#FFB703" />
            </div>
            <motion.h3 whileHover={{ color: "#FFB703" }} transition={{ duration: 0.2 }} style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: "white", margin: "0 0 8px" }}>100% Open Source</motion.h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>Fork it. Contribute. Self-host. <a href="https://github.com/Niteshagarwal01/Resonance" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Star on GitHub</a>.</p>
            <div className="flex items-center gap-2 mt-5">
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#FFB703" color="#FFB703" />)}
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginLeft: 6 }}>4.9 / 5.0</span>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2" delay={0.3} style={{ background: "#FFB703", border: "none", padding: "36px 32px" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(0,0,0,0.06)" }} />
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 200 }}>
              <p style={{ fontSize: 80, fontWeight: 900, letterSpacing: "-0.06em", color: "#1A1A1A", margin: 0, lineHeight: 1 }}>$0</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "rgba(26,26,26,0.65)", margin: "8px 0 0", letterSpacing: "-0.01em" }}>Forever. No credit card.</p>
            </motion.div>
          </BentoCard>

          <BentoCard className="md:col-span-2" delay={0.35} style={{ background: "white", border: "1px solid #f0f0f0", padding: "36px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div style={{ position: "absolute", top: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(129,140,248,0.08)" }} />
            <Music size={28} color="#818cf8" style={{ marginBottom: 24 }} />
            <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 200 }}>
              <p style={{ fontSize: 68, fontWeight: 900, letterSpacing: "-0.06em", color: "#1A1A1A", margin: 0, lineHeight: 1 }}>100M+</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#999", margin: "8px 0 0" }}>Tracks. No paywall.</p>
            </motion.div>
          </BentoCard>
        </div>
      </div>
    </section>
  )
}
