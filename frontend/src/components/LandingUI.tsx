"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function MagneticBtn({ children, href, style, className = "" }: { children: React.ReactNode; href: string; style?: React.CSSProperties; className?: string }) {
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
    <motion.div 
      ref={ref} 
      className={className} 
      style={{ x: sx, y: sy, display: className.includes('hidden') ? undefined : "inline-block" }} 
      onMouseMove={handle} 
      onMouseLeave={reset} 
      whileTap={{ scale: 0.94 }}
    >
      <Link href={href} style={{ ...style, display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        {children}
      </Link>
    </motion.div>
  );
}

export function BentoCard({ children, className = "", style = {}, delay = 0 }: {
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
