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
        <Image 
          src={favAppIcon} 
          alt="Resonance Icon" 
          style={{ height: size * 1.2, width: 'auto' }}
          className="shrink-0 object-contain drop-shadow-xl"
        />
      ) : (
        <Image 
          src={mainLogo} 
          alt="Resonance Logo" 
          style={{ height: size * 1.4, width: 'auto' }}
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
