"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MagneticBtn } from "../LandingUI";
import { Logo } from "@/components/Logo";

export function FooterSection() {
  return (
    <footer style={{ background: "#0D0D0D", color: "white", paddingTop: 100, paddingBottom: 56, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", fontSize: "22vw", fontWeight: 900, color: "rgba(255,255,255,0.025)", whiteSpace: "nowrap", pointerEvents: "none", letterSpacing: "-0.07em", lineHeight: 0.85 }}>
        RESONANCE
      </div>
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
          <div className="md:col-span-5">
            <div className="mb-6">
              <Logo variant="horizontal" size={48} theme="dark" />
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
                <li key={l} style={{ listStyle: "none" }}>
                  {l === "GitHub" ? (
                    <a href="https://github.com/Niteshagarwal01/Resonance" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14 }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>{l}</a>
                  ) : (
                    <a href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14 }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>{l}</a>
                  )}
                </li>
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
              l === "GitHub" ? (
                <a key={l} href="https://github.com/Niteshagarwal01/Resonance" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>{l}</a>
              ) : (
                <Link key={l} href="#" style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>{l}</Link>
              )
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
