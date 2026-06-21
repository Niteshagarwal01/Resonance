"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Mail, Lock, AlertCircle, Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/onboarding");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative" style={{ background: "#FAFAF8", color: "#1A1A1A" }}>
      <div className="grain-overlay z-10 pointer-events-none" />

      {/* FULL SCREEN AMBIENT BACKGROUND (Continuous Gradient) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="blob-orange absolute" style={{ width: 1000, height: 1000, top: -200, left: -200, opacity: 0.6 }} />
        <div className="blob-purple absolute" style={{ width: 800, height: 800, bottom: -100, right: -100, opacity: 0.4 }} />
        <div className="blob-green absolute" style={{ width: 600, height: 600, top: "20%", right: "20%", opacity: 0.3 }} />
        <div className="dot-grid absolute inset-0 opacity-[0.25]" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.04 }}>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="6 12" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="6 12" />
        </svg>
      </div>

      {/* BRANDING LOGO (Absolute Top Left) */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-30">
        <Logo variant="horizontal" size={48} />
      </div>

      {/* MAIN CONTENT CONTAINER (Perfectly Centered) */}
      <div className="flex-1 w-full flex items-center justify-center z-20 p-6 md:p-12 min-h-screen">
        <div className="w-full max-w-7xl flex flex-col xl:flex-row items-center xl:justify-between justify-center gap-12 xl:gap-24">
          
          {/* LEFT SECTION - Text */}
          <div className="hidden md:block flex-1 w-full max-w-[440px] xl:max-w-[600px] text-center xl:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2.5 mb-6" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.06)", padding: "8px 16px", borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <Zap size={14} color="#FFB703" fill="#FFB703" />
                Welcome Back
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ fontSize: "clamp(3.5rem, 6vw, 6.5rem)", fontWeight: 900, color: "#1A1A1A", letterSpacing: "-0.04em", lineHeight: 0.95 }}
            >
              Pick up<br/>
              <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #1A1A1A 0%, #888 100%)", backgroundClip: "text" }}>right where</span><br/>
              you left off<span style={{ color: "#FFB703" }}>.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ color: "#555", fontSize: "1.25rem", marginTop: 24, maxWidth: 500, fontWeight: 500, lineHeight: 1.6 }}
            >
              Access your saved tracks, custom playlists, and infinite auto-play sessions.
            </motion.p>
          </div>

          {/* RIGHT SECTION - Auth Form */}
          <div className="w-full flex-1 flex justify-center xl:justify-end max-w-[480px] xl:max-w-[500px] relative">

            {/* Floating Glassmorphic Login Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="w-full p-8 sm:p-12 rounded-[2.5rem] relative z-10"
          style={{ 
            background: "rgba(255,255,255,0.75)", 
            backdropFilter: "blur(30px)", 
            border: "1.5px solid rgba(255,255,255,0.9)", 
            boxShadow: "0 24px 60px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)" 
          }}
        >
          <div className="mb-10 text-center">
            <h2 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#1A1A1A", letterSpacing: "-0.04em", margin: "0 0 8px 0" }}>Log in</h2>
            <p style={{ color: "#777", fontSize: 16, margin: 0, fontWeight: 500 }}>Enter your details to proceed.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              <AlertCircle color="#ef4444" size={20} className="shrink-0 mt-0.5" />
              <span style={{ color: "#ef4444", fontSize: 14, fontWeight: 600 }}>{error}</span>
            </motion.div>
          )}

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all active:scale-95 shadow-sm hover:shadow-md"
            style={{ background: "white", color: "#1A1A1A", fontWeight: 800, fontSize: 16, border: "1px solid #e5e5e5", cursor: "pointer" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-black/5" />
            <span style={{ color: "#999", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>or email</span>
            <div className="flex-1 h-px bg-black/5" />
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            <div className="relative group">
              <Mail size={20} color="#999" className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#1A1A1A] transition-colors" />
              <input 
                type="email" placeholder="Email address" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-black/5 text-[#1A1A1A] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#1A1A1A]/20 focus:ring-4 focus:ring-[#1A1A1A]/5 transition-all placeholder:text-[#aaa] shadow-sm"
                style={{ fontSize: 16, fontWeight: 600 }}
              />
            </div>
            <div className="relative group">
              <Lock size={20} color="#999" className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#1A1A1A] transition-colors" />
              <input 
                type="password" placeholder="Password" required
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-white border border-black/5 text-[#1A1A1A] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#1A1A1A]/20 focus:ring-4 focus:ring-[#1A1A1A]/5 transition-all placeholder:text-[#aaa] shadow-sm"
                style={{ fontSize: 16, fontWeight: 600 }}
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mt-4 transition-all active:scale-95 disabled:opacity-50 hover:shadow-xl hover:shadow-black/10"
              style={{ background: "#1A1A1A", color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer", border: "none" }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-8" style={{ color: "#777", fontSize: 14, fontWeight: 600 }}>
            Don&apos;t have an account? <Link href="/signup" className="text-[#1A1A1A] hover:underline" style={{ fontWeight: 800 }}>Sign up</Link>
          </p>
        </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
