import { motion } from "framer-motion";
import { Smartphone, Download, Sparkles, Play, Pause, SkipForward, SkipBack, Heart, MoreHorizontal, Repeat, Shuffle, Zap } from "lucide-react";
import { SafeImage as Image } from "@/components/SafeImage";

export function MobileAppSection() {
  return (
    <section className="relative w-full py-32 overflow-hidden bg-[#FAFAF8]" id="mobile">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFB703] rounded-full mix-blend-multiply filter blur-[150px] opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-[0.25]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2.5 mb-8"
              style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid rgba(0,0,0,0.07)", padding: "7px 18px", borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", width: "fit-content", color: "#FFB703" }}
            >
              <Sparkles size={14} fill="#FFB703" />
              Coming Soon
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: "clamp(3.5rem, 8vw, 6.5rem)", fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 0.9, color: "#1A1A1A", margin: "0 0 28px" }}
            >
              Take Resonance <br />
              <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #FFB703 0%, #ff5e62 100%)", backgroundClip: "text", paddingBottom: "2px" }}>anywhere.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 20, color: "#777", fontWeight: 500, lineHeight: 1.7, margin: "0 auto 44px", maxWidth: 500 }}
              className="md:mx-0"
            >
              The ultimate music experience is coming to iOS and Android. Seamless handoff, offline mode, and your Taste DNA—right in your pocket.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
            >
              <button 
                className="flex items-center justify-center gap-3 w-full sm:w-auto"
                style={{ background: "rgba(26,26,26,0.3)", color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 16, padding: "18px 40px", borderRadius: 14, letterSpacing: "-0.01em", cursor: "not-allowed", border: "1px solid rgba(26,26,26,0.1)" }}
                disabled
              >
                <Smartphone size={18} />
                App Store <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 100, marginLeft: 4 }}>Soon</span>
              </button>
              <button 
                className="flex items-center justify-center gap-3 w-full sm:w-auto"
                style={{ background: "rgba(255,255,255,0.5)", color: "rgba(26,26,26,0.4)", fontWeight: 800, fontSize: 16, padding: "18px 40px", borderRadius: 14, letterSpacing: "-0.01em", cursor: "not-allowed", border: "1px solid rgba(0,0,0,0.05)" }}
                disabled
              >
                <Download size={18} />
                Google Play <span style={{ fontSize: 11, background: "rgba(0,0,0,0.06)", padding: "2px 8px", borderRadius: 100, marginLeft: 4 }}>Soon</span>
              </button>
            </motion.div>
          </div>

        {/* Visual Device Mockup (Detailed Player) */}
          <div className="flex-1 w-full max-w-[360px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -15, rotateX: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: -5, rotateX: 5 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 60, damping: 20 }}
              className="relative w-full rounded-[3.5rem] border-[12px] border-[#0D0D0D] bg-[#1A1A1A] shadow-2xl shadow-black/40 overflow-hidden group perspective-1000"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Fake UI inside the phone */}
              <div className="relative w-full p-6 pt-10" style={{ background: "#1A1A1A" }}>
                {/* Dynamic Island / Notch area */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-7 bg-[#0D0D0D] rounded-b-3xl z-50"></div>
                
                {/* Glow inside card */}
                <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.25)", filter: "blur(50px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,183,3,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />
                
                {/* Header row */}
                <div className="flex items-center justify-between mb-6 relative z-10">
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
                <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 22, marginBottom: 20, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #FFB703 0%, #FF6B35 50%, #8B5CF6 100%)", zIndex: 10 }}>
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
                <div className="flex items-end gap-[3px] mb-4 relative z-10" style={{ height: 40 }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 8, position: "relative", zIndex: 10 }}>
                  <span>1:47</span><span>3:22</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 20, position: "relative", zIndex: 10 }}>
                  <div style={{ width: "52%", height: "100%", background: "#FFB703", borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: "52%", top: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: "#FFB703", boxShadow: "0 0 0 3px rgba(255,183,3,0.3)" }} />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6 relative z-10">
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
                <div className="relative z-10">
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
                style={{ position: "absolute", bottom: -16, left: -20, background: "#FFB703", borderRadius: 14, padding: "10px 18px", boxShadow: "0 12px 40px rgba(255,183,3,0.3)", display: "flex", alignItems: "center", gap: 8, zIndex: 60 }}
              >
                <Zap size={14} color="#1A1A1A" fill="#1A1A1A" />
                <span style={{ fontSize: 12, fontWeight: 900, color: "#1A1A1A" }}>Auto-Play ON</span>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
