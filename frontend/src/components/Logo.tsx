import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LogoProps {
  variant?: 'icon-only' | 'horizontal' | 'app-icon';
  theme?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
  size?: number;
}

export function Logo({ variant = 'horizontal', theme = 'light', showSubtitle = true, className = '', size = 48 }: LogoProps) {
  // The exact brand colors from the design system
  const colors = {
    orange: '#FF7A3D',
    green: '#54D38A',
    purple: '#B97BE6',
    blue: '#5D7FFF',
    dark: '#111111',
    light: '#FFFFFF',
  };

  const primaryColor = theme === 'light' ? colors.dark : colors.light;

  // An approximated SVG of the Resonance ear/spiral logo based on the construction grid.
  // We will ask the user to swap this path with the final exported SVG from Figma.
  const LogoMark = (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={primaryColor}>
        {/* Left dot */}
        <circle cx="20" cy="50" r="8" />
        {/* Connecting line */}
        <rect x="20" y="44" width="30" height="12" />
        {/* Inner spiral origin */}
        <circle cx="50" cy="50" r="14" />
        {/* Spiral arcs (Approximated for now) */}
        <path d="M 50 64 C 65 64 72 55 72 40 C 72 25 55 20 45 25 L 50 35 C 55 33 60 35 60 40 C 60 48 55 52 50 52 Z" />
        <path d="M 50 82 C 75 82 90 65 90 40 C 90 15 65 -2 40 5 L 45 17 C 62 13 78 25 78 40 C 78 58 65 70 50 70 C 35 70 28 60 28 50 L 16 50 C 16 68 30 82 50 82 Z" />
      </g>
    </svg>
  );

  const innerContent = (
    <>
      {/* Icon Wrapper */}
      {variant === 'app-icon' ? (
        <motion.div 
          className="flex items-center justify-center shadow-2xl shrink-0" 
          style={{ width: size, height: size, background: colors.dark, borderRadius: size * 0.22 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div style={{ width: size * 0.6, height: size * 0.6 }} className="text-white fill-white">
            {/* White version of the mark for the dark app icon */}
            <svg viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="50" r="8" />
              <rect x="20" y="44" width="30" height="12" />
              <circle cx="50" cy="50" r="14" />
              <path d="M 50 64 C 65 64 72 55 72 40 C 72 25 55 20 45 25 L 50 35 C 55 33 60 35 60 40 C 60 48 55 52 50 52 Z" />
              <path d="M 50 82 C 75 82 90 65 90 40 C 90 15 65 -2 40 5 L 45 17 C 62 13 78 25 78 40 C 78 58 65 70 50 70 C 35 70 28 60 28 50 L 16 50 C 16 68 30 82 50 82 Z" />
            </svg>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="shrink-0"
          style={{ width: size, height: size }}
          whileHover={{ rotate: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {LogoMark}
        </motion.div>
      )}

      {/* Typography */}
      {variant === 'horizontal' && (
        <div className="flex flex-col justify-center">
          <span 
            style={{ 
              fontWeight: 900, 
              fontSize: size * 0.8, 
              letterSpacing: "-0.04em", 
              color: primaryColor,
              lineHeight: 0.9
            }}
          >
            Resonance
          </span>
          {showSubtitle && (
            <span 
              style={{ 
                fontWeight: 700, 
                fontSize: size * 0.22, 
                letterSpacing: "0.15em", 
                color: theme === 'light' ? "#666" : "rgba(255,255,255,0.6)",
                marginTop: size * 0.1,
                textTransform: "uppercase"
              }}
            >
              Taste DNA. Evolving with you.
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <Link href="/" className={`flex items-center gap-4 w-fit group ${className}`} style={{ textDecoration: "none" }}>
      {innerContent}
    </Link>
  );
}
