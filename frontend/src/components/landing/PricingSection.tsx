"use client";

import { motion } from "framer-motion";
import { Globe, ArrowRight, Zap, Users, BarChart3, Music, CheckCircle2 } from "lucide-react";
import { MagneticBtn } from "../LandingUI";

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-20 px-6 overflow-hidden">
      <div className="dot-grid absolute inset-0 opacity-50 pointer-events-none" />
      <div className="blob-purple absolute w-[700px] h-[700px] opacity-30" style={{ top: 0, left: "-150px" }} />
      <div className="blob-orange absolute w-[500px] h-[500px] opacity-25" style={{ bottom: 0, right: "-100px" }} />

      <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ type: "spring", stiffness: 60, damping: 20 }}
        className="max-w-6xl mx-auto relative z-10"
        style={{ background: "white", borderRadius: 44, padding: "80px 60px", boxShadow: "0 40px 100px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #818cf8, #FFB703, #f87171, #a3e4b0)" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.04)" }} />
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.05)" }} />

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-8" style={{ background: "rgba(163,228,176,0.18)", color: "#2d6a3e", padding: "9px 20px", borderRadius: 10, fontWeight: 800, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <Globe size={16} /> Open Source Platform
            </div>
            <h2 style={{ fontSize: "clamp(3.5rem, 8vw, 6.5rem)", fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 0.9, color: "#1A1A1A", margin: "0 0 28px" }}>
              Zero dollars.<br />Zero ads.
            </h2>
            <p style={{ fontSize: 20, color: "#777", fontWeight: 500, lineHeight: 1.7, margin: "0 0 44px" }}>
              Streaming platforms charge $15/month for basic features. We bypassed their catalogs and built a better UI. Free. Community-owned.
            </p>
            <MagneticBtn href="/signup" style={{ background: "#FFB703", color: "#1A1A1A", fontWeight: 900, fontSize: 20, padding: "22px 52px", borderRadius: 20, boxShadow: "0 20px 48px rgba(255,183,3,0.28)", letterSpacing: "-0.02em" }}>
              Create Account <ArrowRight size={22} strokeWidth={3} />
            </MagneticBtn>
          </div>

          <div className="flex-1 w-full" style={{ background: "#FAFAF8", borderRadius: 28, padding: 40, border: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#ccc", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 28px" }}>Everything Included</p>
            <div className="space-y-5">
              {[
                { label: "Infinite Auto-Play Engine", icon: Zap, color: "#FFB703" },
                { label: "Global Community Queues", icon: Users, color: "#818cf8" },
                { label: "Taste DNA Visualization", icon: BarChart3, color: "#f87171" },
                { label: "100M+ Track Library", icon: Music, color: "#a3e4b0" },
                { label: "Zero Advertisements", icon: CheckCircle2, color: "#22c55e" },
              ].map((feat, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.08 }}
                  whileHover={{ x: 8, background: "rgb(255,255,255)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                  className="flex items-center gap-4"
                  style={{ padding: "12px 16px", borderRadius: 14, cursor: "pointer", transition: "background 0.2s, box-shadow 0.2s" }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.06)", flexShrink: 0 }}>
                    <feat.icon size={20} color={feat.color} />
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.01em" }}>{feat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
