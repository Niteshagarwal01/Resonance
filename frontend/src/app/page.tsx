"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring, animate, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Users,
  Zap,
  Globe,
  Star,
  CheckCircle2,
  Music,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ─── Removed Custom Cursor as per user request ──────────────────────── */

/* ─── Magnetic Button ──────────────────────────────────── */
function MagneticBtn({ children, href, style }: { children: React.ReactNode; href: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });
  const handle = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.28);
    y.set((e.clientY - r.top - r.height / 2) * 0.28);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy, display: "inline-block" }} onMouseMove={handle} onMouseLeave={reset} whileTap={{ scale: 0.94 }}>
      <Link href={href} style={{ ...style, display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        {children}
      </Link>
    </motion.div>
  );
}

/* ─── Bento Card ──────────────────────────────────── */
function BentoCard({ children, className = "", style = {}, delay = 0 }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, scale: 1.01 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100, damping: 20 }}
      className={className}
      style={{ borderRadius: 28, overflow: "hidden", position: "relative", ...style }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Counter ──────────────────────────────────── */
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const ctrl = animate(0, to, { duration: 1.8, ease: "easeOut", onUpdate: (v) => setVal(Math.round(v)) });
        observer.disconnect();
        return () => ctrl.stop();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Crazy Timeline Section ──────────────────────────────────── */
const TimelineSection = () => {
  const bgColors = ["#f87171", "#3b82f6", "#ef4444", "#22c55e", "#d946ef", "#FFB703"];
  const eras = [
    { year: "1995", name: "MP3 format goes public", desc: "Audio file compression enables seamless distribution of music over the internet for the first time." },
    { year: "1999", name: "Napster launches", desc: "The first peer-to-peer file sharing network for MP3 files launches. Attracted over 80 million users, fundamentally reshaping how people accessed music." },
    { year: "2000", name: "LimeWire launches", desc: "Peer-to-peer file-sharing platform becomes a major tool for the illegal download and distribution of pirated music." },
    { year: "2001", name: "iPod & iTunes", desc: "Apple releases the first iPod. \"1,000 songs in your pocket\". iTunes launches to organize digital music." },
    { year: "2001", name: "Napster shutdown", desc: "Forced to shut down after losing landmark copyright infringement lawsuit brought by the RIAA – the first major shutdown over music piracy." },
    { year: "2003", name: "iTunes Store launches", desc: "One of the first successful legal digital music marketplaces, achieving one million downloads in just three days." },
    { year: "2005", name: "Pandora & YouTube", desc: "Pandora launches as a subscription-based internet radio. YouTube allows easy video uploads and sharing." },
    { year: "2007", name: "Streams count for Billboard", desc: "Music streams begin to count towards the Billboard Hot 100 for the first time. The legitimacy of streaming is recognized." },
    { year: "2008", name: "Spotify & App Store", desc: "Spotify launches in select European countries with a freemium model. iPhone App Store brings portable streaming." },
    { year: "2010", name: "LimeWire shuttered", desc: "A critical turning point as the music industry moves away from the piracy era towards legal on-demand streaming services." },
    { year: "2011", name: "Spotify launches in US", desc: "Brings legal, on-demand music streaming to the world’s largest music market, accelerating global shifts to subscription models." },
    { year: "2015", name: "Apple & YouTube Music", desc: "Apple Music and YouTube Music launch. Spotify introduces 'Discover Weekly' algorithm, reshaping music discovery." },
    { year: "2016", name: "Streaming hits $3.9B", desc: "Streaming becomes the dominant form of music consumption and the biggest revenue source for the recorded music industry in the US." },
    { year: "2021", name: "Industry Reaches $25.9B", desc: "Global recorded music industry revenue surpasses the previous peak achieved during the CD era." },
    { year: "2025", name: "Global Revenue tops $30B", desc: "A revenue breakthrough underlining streaming’s crucial role in global music industry growth with streaming accounting for 67%." },
    { year: "2026", name: "Resonance", desc: "The next evolution. An open-source, limitless community music platform." },
  ];

  return (
    <section id="timeline" className="relative pb-40 pt-32" style={{ background: "#0D0D0D", color: "white", overflow: "hidden" }}>
      {/* Timeline Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-20 md:mb-40 relative z-20 text-center md:text-left">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: "clamp(4rem, 11vw, 8rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
            The Evolution<br/>of <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #FFB703 0%, #ff5e62 100%)", backgroundClip: "text" }}>Music.</span>
          </h2>
          <p style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", color: "rgba(255,255,255,0.5)", marginTop: 24, maxWidth: 600, fontWeight: 500, lineHeight: 1.5 }}>
            From the public release of the MP3 to the dawn of open-source algorithms, explore the pivotal eras that paved the way for Resonance.
          </p>
        </motion.div>
      </div>

      {/* Central Line */}
      <div className="absolute top-0 bottom-0 left-[24px] md:left-1/2 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 z-0" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {eras.map((era, i) => {
          const isEven = i % 2 === 0;
          const color = bgColors[i % bgColors.length];
          return (
            <motion.div key={i} initial="hidden" whileInView="show" viewport={{ margin: "-15%", once: true }}
              className={`relative flex items-center w-full py-8 md:py-20 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'}`}
            >
              {/* Center Dot */}
              <motion.div variants={{ hidden: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1 } }}
                className="absolute left-[24px] md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full z-20 border-4 border-[#0D0D0D]"
                style={{ background: color, boxShadow: `0 0 20px ${color}, 0 0 40px ${color}` }}
              />

              {/* Empty Space for the other side */}
              <div className="hidden md:block md:w-1/2" />

              {/* Content */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } } }}
                className={`w-full md:w-1/2 pl-12 md:pl-0 flex flex-col relative ${isEven ? 'md:pr-16 md:items-end' : 'md:pl-16 md:items-start'}`}
              >
                {/* Background Huge Year */}
                <div style={{ fontSize: "clamp(6rem, 15vw, 15rem)", fontWeight: 900, color: "rgba(255,255,255,0.03)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: -1, letterSpacing: "-0.05em", whiteSpace: "nowrap", pointerEvents: "none" }}>{era.year}</div>
                
                {/* Blur Glow behind content */}
                <div style={{ position: "absolute", inset: "-50%", filter: "blur(100px)", background: color, opacity: 0.15, zIndex: -1, pointerEvents: "none" }} />

                {/* Glassmorphic Card */}
                <div 
                  className={`relative w-full p-8 sm:p-10 rounded-3xl transition-transform hover:-translate-y-2 duration-500 text-left ${isEven ? 'md:text-right' : 'md:text-left'}`}
                  style={{ 
                    background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)", 
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 900, color: color, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12, display: "block" }}>{era.year}</span>
                  <h3 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px 0", color: "white", lineHeight: 1.1 }}>{era.name}</h3>
                  <p style={{ fontSize: "clamp(1.1rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontWeight: 500 }}>{era.desc}</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

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
      } catch (e) {}
    };

    const playHoverSound = () => {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      } catch (e) {}
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

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const item = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 80, damping: 20 } },
  };

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
          <Link href="/" className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 200 }}
              className="w-10 h-10 flex items-center justify-center" style={{ background: "#1A1A1A", borderRadius: 12 }}
            >
              <Music size={18} color="white" strokeWidth={3} />
            </motion.div>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.04em" }}>Resonance</span>
          </Link>

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
            <MagneticBtn href="/signup" style={{ background: "#1A1A1A", color: "white", fontWeight: 800, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
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
              <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: "white", borderRadius: 12 }}>
                  <Music size={18} color="#0a0a0a" strokeWidth={3} />
                </div>
                <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.04em", color: "white" }}>Resonance</span>
              </Link>
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
              
              <div className="mt-auto pb-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
                >
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center justify-center w-full py-5 rounded-2xl active:scale-95 transition-transform"
                    style={{ background: "white", color: "#0a0a0a", fontSize: "1.2rem", fontWeight: 800, textDecoration: "none", boxShadow: "0 10px 30px rgba(255,255,255,0.15)" }}
                  >
                    Login to Account
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HERO ══ */}
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
              <MagneticBtn href="#features" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(0,0,0,0.09)", color: "#1A1A1A", fontWeight: 700, fontSize: 15, padding: "15px 30px", borderRadius: 14 }}>
                See Features <ArrowUpRight size={16} />
              </MagneticBtn>
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

              {/* 12k listening chip removed as requested */}

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


      {/* ══ BUILT WITH BAR ══ */}
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

      {/* ══ BENTO FEATURES ══ */}
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
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>Fork it. Contribute. Self-host. Star on GitHub.</p>
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

      {/* ══ HOW IT WORKS ══ */}
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
                { icon: Globe, color: "#f87171", label: "04 — Open Platform", desc: "100% open-source. Star on GitHub, fork it, self-host it. The music is yours." },
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

      <TimelineSection />

      {/* ══ PRICING ══ */}
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

      {/* ══ FOOTER ══ */}
      <footer style={{ background: "#0D0D0D", color: "white", paddingTop: 100, paddingBottom: 56, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", fontSize: "22vw", fontWeight: 900, color: "rgba(255,255,255,0.025)", whiteSpace: "nowrap", pointerEvents: "none", letterSpacing: "-0.07em", lineHeight: 0.85 }}>
          RESONANCE
        </div>
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Music size={22} color="#111" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.05em" }}>Resonance.</span>
              </div>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 340, margin: "0 0 32px" }}>
                The open-source music player that hijacked YouTube Music&apos;s algorithm. Free. Forever.
              </p>
              <MagneticBtn href="/signup" style={{ background: "#FFB703", color: "#1A1A1A", fontWeight: 900, fontSize: 16, padding: "14px 32px", borderRadius: 14 }}>
                Start Free <ArrowRight size={17} strokeWidth={3} />
              </MagneticBtn>
            </div>

            <div className="md:col-span-3 md:col-start-7">
              <p style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 24px" }}>Product</p>
              <div className="flex flex-col gap-4">
                {["Features", "How It Works", "Timeline", "Pricing", "GitHub"].map(l => (
                  <Link key={l} href="#" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 16, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "white")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >{l}</Link>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <p style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 24px" }}>Account</p>
              <div className="flex flex-col gap-4">
                {["Sign Up", "Login", "Dashboard", "Settings"].map(l => (
                  <Link key={l} href="#" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 16, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "white")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >{l}</Link>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 32, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", margin: 0, fontWeight: 600 }}>
              © 2024 Resonance. Open Source. MIT License.
            </p>
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "GitHub"].map(l => (
                <Link key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontWeight: 700, textDecoration: "none" }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
