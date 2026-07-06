/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import companyLogo from '../assets/ATLAS_LOGO.png';

interface LogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
  withBg?: boolean;
  padding?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  objectFit?: 'contain' | 'cover';
  imageStyle?: React.CSSProperties;
}

export default function Logo({
  className = '',
  size = 48,
  glow = true,
  withBg = true,
  padding = 10,
  paddingBottom,
  paddingLeft,
  objectFit = 'contain',
  imageStyle,
}: LogoProps) {
  return (
    <div
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      className={`shrink-0 relative overflow-visible flex items-center justify-center ${className} ${
        glow ? 'filter drop-shadow-[0_0_20px_rgba(164,147,247,0.65)]' : ''
      } transition-all duration-300`}
    >
      <div 
        style={{
          padding: `${padding}px`,
          paddingBottom: paddingBottom !== undefined ? `${paddingBottom}px` : undefined,
          paddingLeft: paddingLeft !== undefined ? `${paddingLeft}px` : undefined,
        }}
        className="logo-container w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center border border-zinc-800/50"
      >
        <img
          src={companyLogo}
          alt="Sovereignty Cyber Ops Logo"
          style={imageStyle}
          draggable={false}
          className={`w-full h-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'} select-none`}
        />
      </div>
    </div>
  );
}

