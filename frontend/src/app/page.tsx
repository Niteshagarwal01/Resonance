"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MagneticBtn } from "@/components/LandingUI";
import { TimelineSection } from "@/components/TimelineSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { BuiltWithBar } from "@/components/landing/BuiltWithBar";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FooterSection } from "@/components/landing/FooterSection";
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ─── Removed Custom Cursor as per user request ──────────────────────── */



export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], ["0%", "25%"]);

  // Real stats from Supabase
  const [stats, setStats] = useState({ users: 0, tracks: 100_000_000, cost: 0, loaded: false });
  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => setStats({ users: d.users ?? 0, tracks: d.tracks ?? 100_000_000, cost: 0, loaded: true }))
      .catch(() => setStats(s => ({ ...s, loaded: true })));

    let audioCtx: AudioContext;
    let bgAudio: HTMLAudioElement | null = null;
    let isPlaying = false;

    const startAmbient = () => {
      if (isPlaying) return;
      try {
        isPlaying = true;
        bgAudio = new Audio("/audio/resonance.mpeg?v=2");
        bgAudio.loop = true;
        bgAudio.volume = 0.4;
        bgAudio.play().catch(() => { isPlaying = false; });
      } catch { }
    };

    const playHoverSound = () => {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const hoverOsc = audioCtx.createOscillator();
        const hoverGain = audioCtx.createGain();
        hoverOsc.type = "sine";
        hoverOsc.frequency.setValueAtTime(800, audioCtx.currentTime);
        hoverOsc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
        hoverGain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        hoverGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        hoverOsc.connect(hoverGain);
        hoverGain.connect(audioCtx.destination);
        hoverOsc.start();
        hoverOsc.stop(audioCtx.currentTime + 0.05);
      } catch { }
    };

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, .glow-hover-text, [data-hover-sound]")) playHoverSound();
    };
    
    const handleInteraction = () => startAmbient();
    window.addEventListener("click", handleInteraction);
    window.addEventListener("scroll", handleInteraction, { once: true });
    window.addEventListener("mouseover", over);
    
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("mouseover", over);
      if (bgAudio) {
        bgAudio.pause();
        bgAudio.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "var(--font-sans), sans-serif", background: "#FAFAF8", color: "#1A1A1A" }}>
      <div className="grain-overlay" />

      {/* ══ NAV ══ */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.1 }}
        className="fixed top-5 left-0 right-0 z-[100] px-6"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between px-8 py-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.78)", backdropFilter: "blur(24px)", border: "1.5px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 32px rgba(0,0,0,0.07)" }}
        >
          <Logo variant="horizontal" size={36} />

          <div className="hidden md:flex items-center gap-10" style={{ fontWeight: 700, fontSize: 14, color: "#555" }}>
            {["Features", "Timeline", "Pricing"].map((l, i) => (
              <Link key={l} href={`#${["features", "timeline", "pricing"][i]}`}
                className="group relative" style={{ color: "inherit", textDecoration: "none" }}
              >
                {l}
                <motion.span className="absolute bottom-0 left-0 w-full h-0.5 bg-black origin-left" initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.22 }} />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" style={{ fontWeight: 700, fontSize: 14, color: "#555", textDecoration: "none" }} className="hover:text-black transition-colors hidden sm:block">Login</Link>
            <MagneticBtn href="/signup" className="hidden sm:inline-block" style={{ background: "#1A1A1A", color: "white", fontWeight: 800, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              <span className="hidden sm:inline">Start Free</span><span className="sm:hidden">Start</span> <ArrowRight size={15} strokeWidth={2.5} />
            </MagneticBtn>
            <button className="md:hidden flex items-center justify-center p-2 ml-1 rounded-full hover:bg-black/5 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={26} color="#1A1A1A" />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at 100% 0)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 100% 0)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 100% 0)" }}
            transition={{ type: "spring", stiffness: 70, damping: 20 }}
            className="fixed inset-0 z-[200] flex flex-col px-6 py-8 overflow-hidden"
            style={{ background: "#0a0a0a" }}
          >
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="blob-orange absolute" style={{ width: 400, height: 400, top: -100, right: -100, opacity: 0.25 }} />
              <div className="blob-purple absolute" style={{ width: 500, height: 500, bottom: -100, left: -200, opacity: 0.25 }} />
              <div className="dot-grid absolute inset-0 opacity-[0.1]" />
            </div>

            <div className="flex justify-between items-center mb-12 relative z-10 px-2">
              <div onClick={() => setIsMobileMenuOpen(false)}>
                <Logo variant="horizontal" size={32} theme="dark" />
              </div>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={32} color="white" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 relative z-10 h-full">
              {["Features", "Timeline", "Pricing"].map((l, i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 + i * 0.1 }}
                >
                  <Link href={`#${["features", "timeline", "pricing"][i]}`} onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-6 rounded-3xl transition-transform active:scale-95"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}
                  >
                    <span style={{ fontSize: "clamp(1.8rem, 8vw, 3rem)", fontWeight: 900, color: "white", letterSpacing: "-0.04em" }}>{l}</span>
                    <ArrowUpRight size={28} color="rgba(255,255,255,0.3)" strokeWidth={2.5} />
                  </Link>
                </motion.div>
              ))}
              
              <div className="mt-auto pb-4 flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
                >
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center justify-center w-full py-5 rounded-2xl active:scale-95 transition-transform gap-2"
                    style={{ background: "#FFB703", color: "#0a0a0a", fontSize: "1.2rem", fontWeight: 900, textDecoration: "none", boxShadow: "0 10px 30px rgba(255,183,3,0.2)" }}
                  >
                    Start Free <ArrowRight size={20} strokeWidth={3} />
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
                >
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center justify-center w-full py-5 rounded-2xl active:scale-95 transition-transform"
                    style={{ background: "rgba(255,255,255,0.05)", color: "white", fontSize: "1.2rem", fontWeight: 800, textDecoration: "none" }}
                  >
                    Login
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroSection stats={stats} heroY={heroY} />
      <BuiltWithBar />
      <FeaturesSection />
      <HowItWorksSection />
      <TimelineSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
}
