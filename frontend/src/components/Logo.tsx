import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

import mainLogo from '../../public/logofiles/main-logo.png';
import favAppIcon from '../../public/logofiles/favappicon.png';

interface LogoProps {
  variant?: 'icon-only' | 'horizontal' | 'app-icon';
  theme?: 'light' | 'dark';
  className?: string;
  size?: number;
}

export function Logo({ variant = 'horizontal', theme = 'light', className = '', size = 48 }: LogoProps) {
  const innerContent = (
    <>
      {variant === 'app-icon' ? (
        <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0">
          <Image 
            src={favAppIcon} 
            alt="Resonance Icon" 
            style={{ width: '100%', height: 'auto', transform: 'scale(1.2)' }}
            className="shrink-0 object-contain drop-shadow-xl"
          />
        </div>
      ) : (
        <div style={{ width: size * 3.5, height: size }} className="relative flex items-center justify-center shrink-0">
          <Image 
            src={mainLogo} 
            alt="Resonance Logo" 
            style={{ width: '100%', height: 'auto', transform: 'scale(3.5)' }}
            className={`shrink-0 object-contain ${theme === 'dark' ? 'invert brightness-0' : ''}`}
          />
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
