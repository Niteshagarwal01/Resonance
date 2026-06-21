import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import Image from 'next/image';

interface LogoProps {
  variant?: 'icon-only' | 'horizontal' | 'app-icon';
  theme?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
  size?: number;
}

export function Logo({ variant = 'horizontal', theme = 'light', showSubtitle = true, className = '', size = 48 }: LogoProps) {
  const innerContent = (
    <>
      {variant === 'app-icon' ? (
        <Image 
          src="/logofiles/favappicon.svg" 
          alt="Resonance Icon" 
          width={size} 
          height={size} 
          className="shrink-0 object-contain drop-shadow-xl"
        />
      ) : (
        <Image 
          src="/logofiles/main%20logo.svg" 
          alt="Resonance Logo" 
          width={variant === 'horizontal' ? size * 4 : size} 
          height={size} 
          className={`shrink-0 object-contain ${theme === 'dark' ? 'invert brightness-0' : ''}`}
        />
      )}
    </>
  );

  return (
    <Link href="/" className={`flex items-center gap-4 w-fit group ${className}`} style={{ textDecoration: "none" }}>
      {innerContent}
    </Link>
  );
}
