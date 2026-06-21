"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowRight, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
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
      router.push("/dashboard");
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="blob-orange absolute" style={{ width: 600, height: 600, top: "10%", right: "-10%", opacity: 0.15 }} />
        <div className="blob-purple absolute" style={{ width: 800, height: 800, bottom: "-20%", left: "-20%", opacity: 0.15 }} />
        <div className="dot-grid absolute inset-0 opacity-[0.15]" />
      </div>

      <Link href="/" className="absolute top-8 left-8 z-20 text-white opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2" style={{ fontWeight: 600, textDecoration: "none" }}>
        <ArrowRight size={20} className="rotate-180" /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl relative z-10 mx-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(40px)", boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)" }}
      >
        <div className="text-center mb-10">
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 900, color: "white", letterSpacing: "-0.04em", margin: "0 0 10px 0" }}>Welcome back.</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, margin: 0, fontWeight: 500 }}>Log in to access your Resonance dashboard.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <AlertCircle color="#ef4444" size={20} className="shrink-0 mt-0.5" />
            <span style={{ color: "#ef4444", fontSize: 14, fontWeight: 500 }}>{error}</span>
          </motion.div>
        )}

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl transition-all active:scale-95 hover:bg-white/90"
          style={{ background: "white", color: "#1A1A1A", fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/10" />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>or email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div className="relative group">
            <Mail size={20} color="rgba(255,255,255,0.4)" className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
            <input 
              type="email" placeholder="Email address" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/30"
              style={{ fontSize: 16, fontWeight: 500 }}
            />
          </div>
          <div className="relative group">
            <Lock size={20} color="rgba(255,255,255,0.4)" className="absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
            <input 
              type="password" placeholder="Password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/30"
              style={{ fontSize: 16, fontWeight: 500 }}
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl mt-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer" }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign in"}
          </button>
        </form>

        <p className="text-center mt-8" style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500 }}>
          Don't have an account? <Link href="/signup" className="text-white hover:underline" style={{ fontWeight: 700 }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
