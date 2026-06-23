"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Play, ArrowUpRight, Zap, BarChart3, Music, Users, Globe, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { MagneticBtn, BentoCard } from "@/components/LandingUI";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TimelineSection } from "@/components/TimelineSection";

export function HeroSection({ stats, heroY }: { stats: any, heroY: any }) {
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const item = { hidden: { opacity: 0, y: 40, filter: "blur(8px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 80, damping: 20 } } };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-16">
        {/* Background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0 pointer-events-none">
          <div className="blob-orange absolute" style={{ width: 900, height: 900, top: -300, right: -250, opacity: 0.7 }} />
          <div className="blob-green absolute" style={{ width: 700, height: 700, bottom: -200, left: -200, opacity: 0.5 }} />
          <div className="blob-purple absolute" style={{ width: 500, height: 500, top: "30%", left: "35%", opacity: 0.35 }} />
        </motion.div>
        <div className="dot-grid absolute inset-0 opacity-[0.35] pointer-events-none z-0" />
        {/* Geometric rule lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.06 }}>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="6 12" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="6 12" />
        </svg>

        <motion.div
          variants={container} initial="hidden" animate="show"
          className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <motion.div variants={item}>
              <div className="inline-flex items-center gap-2.5" style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(0,0,0,0.07)", padding: "7px 18px", borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", width: "fit-content" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Open Source · YouTube Music Algorithm
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={item}>
              <h1 style={{ fontSize: "clamp(3.5rem, 11vw, 7.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0 }}>
                <span style={{ display: "block", color: "#1A1A1A" }}>Discover</span>
                <span style={{ display: "block", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #1A1A1A 0%, #888 100%)", backgroundClip: "text", paddingBottom: "2px" }}>your sound</span>
                <span style={{ display: "block", color: "#1A1A1A" }}>together<span style={{ color: "#FFB703" }}>.</span></span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div variants={item} style={{ fontSize: 18, fontWeight: 500, color: "#555", lineHeight: 1.75, maxWidth: 500 }}>
              <p style={{ margin: 0 }}>Resonance hijacks the YouTube Music algorithm and pairs it with an open-source community layer. Infinite Auto-Play. Live Community Queues. Zero cost.</p>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap items-center gap-4">
              <MagneticBtn href="/signup" style={{ background: "#1A1A1A", color: "white", fontWeight: 900, fontSize: 16, padding: "17px 40px", borderRadius: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.2)", letterSpacing: "-0.02em" }}>
                <Play size={17} fill="white" /> Start Free
              </MagneticBtn>
              <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(0,0,0,0.09)", color: "rgba(26,26,26,0.6)", fontWeight: 800, fontSize: 15, padding: "15px 30px", borderRadius: 14, display: "flex", alignItems: "center", gap: "8px", cursor: "not-allowed" }}>
                Mobile App <span style={{ fontSize: 10, background: "rgba(0,0,0,0.08)", padding: "3px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>Soon</span>
              </div>
            </motion.div>

            {/* Stats row — real data */}
            <motion.div variants={item} className="flex flex-wrap items-center gap-5 sm:gap-8 pt-2">
              {[
                { num: "100M+", label: "Tracks" },
                { num: stats.loaded ? (stats.users === 0 ? "Early" : stats.users.toLocaleString()) : "—", label: stats.users === 0 && stats.loaded ? "Be first" : "Members" },
                { num: "$0", label: "Always free" },
              ].map(({ num, label }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span style={{ fontSize: "clamp(1.2rem, 4vw, 2rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#1A1A1A", lineHeight: 1 }}>{num}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                </div>
              ))}
              <div className="hidden sm:block" style={{ width: 1, height: 40, background: "#e5e5e5", margin: "0 4px" }} />
              <div className="flex -space-x-2">
                {["#FFB703","#a3e4b0","#818cf8","#f87171","#60a5fa"].map((c, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: "2.5px solid #FAFAF8", zIndex: 5 - i }} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN — Player Card ── */}
          <motion.div variants={item} className="flex items-center justify-center">
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "100%", maxWidth: 400, position: "relative" }}
            >
              {/* Main player card */}
              <div style={{ background: "#1A1A1A", borderRadius: 32, padding: "28px", boxShadow: "0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                {/* Glow inside card */}
                <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.25)", filter: "blur(50px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,183,3,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />

                {/* Header row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Now Playing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {["#FFB703", "#818cf8", "#a3e4b0"].map((c, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.8 }} />
                    ))}
                  </div>
                </div>

                {/* Album art */}
                <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 22, marginBottom: 20, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #FFB703 0%, #FF6B35 50%, #8B5CF6 100%)" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 12px rgba(0,0,0,0.15), 0 0 0 24px rgba(0,0,0,0.08)" }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.9)" }} />
                    </motion.div>
                  </div>
                  {/* Geometric overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5))" }} />
                  <div style={{ position: "absolute", bottom: 14, left: 16 }}>
                    <p style={{ fontSize: 17, fontWeight: 900, color: "white", margin: 0, letterSpacing: "-0.02em" }}>Blinding Lights</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0, fontWeight: 700 }}>The Weeknd</p>
                  </div>
                </div>

                {/* Waveform */}
                <div className="flex items-end gap-[3px] mb-4" style={{ height: 40 }}>
                  {[30,55,80,45,70,90,60,75,40,85,65,50,88,42,72,95,38,68,55,80,45,70,90,60,75].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [1, h > 70 ? 1.4 : 0.6, 1] }}
                      transition={{ duration: 0.8 + (i % 5) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
                      style={{ flex: 1, height: `${h}%`, borderRadius: 3, transformOrigin: "bottom", background: i < 14 ? "#FFB703" : "rgba(255,255,255,0.15)" }}
                    />
                  ))}
                </div>

                {/* Progress */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
                  <span>1:47</span><span>3:22</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 20, position: "relative" }}>
                  <div style={{ width: "52%", height: "100%", background: "#FFB703", borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: "52%", top: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: "#FFB703", boxShadow: "0 0 0 3px rgba(255,183,3,0.3)" }} />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                  <motion.button whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M19 20L9 12l10-8v16zm-10 0L1 12l8-8v16z"/></svg>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.08 }} style={{ width: 52, height: 52, borderRadius: "50%", background: "#FFB703", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" fill="#1A1A1A" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M5 4l10 8-10 8V4zm10 0l10 8-10 8V4z"/></svg>
                  </motion.button>
                </div>

                {/* Queue section */}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>Up next · Auto-Play</p>
                  {[
                    { title: "Save Your Tears", artist: "The Weeknd", color: "#f87171", dur: "3:35" },
                    { title: "Starboy", artist: "The Weeknd ft. Daft Punk", color: "#818cf8", dur: "3:50" },
                    { title: "In Your Eyes", artist: "The Weeknd", color: "#a3e4b0", dur: "3:57" },
                  ].map((track, i) => (
                    <motion.div key={i} whileHover={{ x: 4, background: "rgba(255,255,255,0.06)" }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, cursor: "pointer", transition: "background 0.15s" }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: track.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play size={12} fill="white" color="white" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.title}</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.artist}</p>
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 700, flexShrink: 0 }}>{track.dur}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating genre chip */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                style={{ position: "absolute", bottom: -16, left: -20, background: "#FFB703", borderRadius: 14, padding: "10px 18px", boxShadow: "0 12px 40px rgba(255,183,3,0.3)", display: "flex", alignItems: "center", gap: 8 }}
              >
                <Zap size={14} color="#1A1A1A" fill="#1A1A1A" />
                <span style={{ fontSize: 12, fontWeight: 900, color: "#1A1A1A" }}>Auto-Play ON</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll line */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 48, background: "linear-gradient(to bottom, #1A1A1A 0%, transparent 100%)" }}
          />
        </motion.div>
      </section>
  )
}
