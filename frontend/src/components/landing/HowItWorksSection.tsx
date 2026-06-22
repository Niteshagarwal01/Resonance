"use client";

import { motion } from "framer-motion";
import { Play, Zap, Users, Globe, ArrowRight } from "lucide-react";
import { MagneticBtn } from "../LandingUI";

export function HowItWorksSection() {
  return (
    <section id="how" className="relative px-4 py-4 overflow-hidden">
      <div className="relative overflow-hidden rounded-[44px]" style={{ background: "#0D0D0D", padding: "88px 64px" }}>
        <div className="blob-purple absolute w-[600px] h-[600px] opacity-30" style={{ top: "-100px", right: "-100px" }} />
        <div className="blob-blue absolute w-[400px] h-[400px] opacity-20" style={{ bottom: "-80px", left: "-60px" }} />
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.06 }}>
          <circle cx="85%" cy="20%" r="120" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="85%" cy="20%" r="80" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="85%" cy="20%" r="40" stroke="white" strokeWidth="1" fill="none" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="4 8" />
        </svg>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row gap-20 items-start">
          <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 70, damping: 20 }} className="flex-1">
            <p style={{ fontSize: 12, fontWeight: 800, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 16px" }}>THE PIPELINE</p>
            <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.05, color: "white", margin: "0 0 24px" }}>
              How we hacked<br />the algorithm.
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.38)", lineHeight: 1.75, margin: "0 0 44px", maxWidth: 360 }}>
              We reverse-engineered the world&apos;s largest music recommendation engine and built a free, open-source UI for it.
            </p>
            <MagneticBtn href="/signup" style={{ background: "white", color: "#1A1A1A", fontWeight: 800, fontSize: 16, padding: "16px 32px", borderRadius: 14 }}>
              Join the Network <ArrowRight size={18} />
            </MagneticBtn>
          </motion.div>

          <div className="flex-1 w-full space-y-4">
            {[
              { icon: Play, color: "#a3e4b0", label: "01 — The Catalog Bypass", desc: "ytmusicapi pulls from 100M+ songs on YouTube Music. Free. No licensing. No DRM." },
              { icon: Zap, color: "#FFB703", label: "02 — Algorithmic Hijacking", desc: "Auto-Play fires YouTube's own neural network endpoints. Their AI, inside your player." },
              { icon: Users, color: "#818cf8", label: "03 — Supabase Community", desc: "Your listening history, playlists and likes sync in real-time to power the global feed." },
              { icon: Globe, color: "#f87171", label: "04 — Open Platform", desc: <>100% open-source. <a href="https://github.com/Niteshagarwal01/Resonance" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Star on GitHub</a>, fork it, self-host it. The music is yours.</> },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 * i, type: "spring", stiffness: 80 }}
                whileHover={{ x: 6, background: "rgba(255,255,255,0.07)" }}
                className="flex items-start gap-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "22px 24px", cursor: "pointer", transition: "background 0.2s" }}
              >
                <div style={{ width: 50, height: 50, borderRadius: 15, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <step.icon size={22} color={step.color} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15, color: "white", margin: "0 0 5px", letterSpacing: "-0.01em" }}>{step.label}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
