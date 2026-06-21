import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LogoProps {
  variant?: 'icon-only' | 'horizontal' | 'app-icon';
  theme?: 'light' | 'dark';
  className?: string;
  size?: number;
}

export function Logo({ variant = 'horizontal', theme = 'light', className = '', size = 48 }: LogoProps) {
  const primaryColor = theme === 'light' ? '#111111' : '#FFFFFF';

  const LogoMark = (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Outer Arc (Top to Bottom Right) */}
      <path 
        d="M 52 16 A 36 36 0 0 1 88 52 A 36 36 0 0 1 52 88" 
        stroke={primaryColor} 
        strokeWidth="13" 
        strokeLinecap="square"
      />
      
      {/* Inner Spiral */}
      {/* Left Dot */}
      <circle cx="20" cy="52" r="6.5" fill={primaryColor} />
      {/* Center Dot */}
      <circle cx="52" cy="52" r="6.5" fill={primaryColor} />
      
      {/* Path: from left dot -> straight right -> down -> right -> up -> left -> down into center dot */}
      <path 
        d="M 20 52 L 34 52 A 18 18 0 0 0 52 70 A 18 18 0 0 0 70 52 A 18 18 0 0 0 52 34 A 8 8 0 0 0 44 42 A 8 8 0 0 0 52 52" 
        stroke={primaryColor} 
        strokeWidth="13" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  const innerContent = (
    <>
      {variant === 'app-icon' ? (
        <motion.div 
          className="flex items-center justify-center shadow-2xl shrink-0" 
          style={{ width: size, height: size, background: '#111111', borderRadius: size * 0.22 }}
        >
          <div style={{ width: size * 0.65, height: size * 0.65 }} className="text-white">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 52 16 A 36 36 0 0 1 88 52 A 36 36 0 0 1 52 88" stroke="white" strokeWidth="13" strokeLinecap="square" />
              <circle cx="20" cy="52" r="6.5" fill="white" />
              <circle cx="52" cy="52" r="6.5" fill="white" />
              <path d="M 20 52 L 34 52 A 18 18 0 0 0 52 70 A 18 18 0 0 0 70 52 A 18 18 0 0 0 52 34 A 8 8 0 0 0 44 42 A 8 8 0 0 0 52 52" stroke="white" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </motion.div>
      ) : (
        LogoMark
      )}

      {/* Typography */}
      {variant === 'horizontal' && (
        <div className="flex flex-col justify-center">
          <span 
            style={{ 
              fontWeight: 900, 
              fontSize: size * 0.75, 
              letterSpacing: "-0.04em", 
              color: primaryColor,
              lineHeight: 0.95,
              fontFamily: 'var(--font-sans)'
            }}
          >
            Resonance
          </span>
          <span 
            style={{ 
              fontWeight: 700, 
              fontSize: size * 0.17, 
              letterSpacing: "0.15em", 
              color: theme === 'light' ? "#666" : "rgba(255,255,255,0.6)",
              marginTop: size * 0.1,
              textTransform: "uppercase",
              fontFamily: 'var(--font-sans)'
            }}
          >
            Taste DNA. Evolving with you.
          </span>
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
