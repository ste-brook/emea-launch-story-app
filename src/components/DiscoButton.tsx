'use client';

import React, { useState } from 'react';
import { useDiscoMode } from '@/hooks/useDiscoMode';

export default function DiscoButton() {
  const { isDiscoMode, toggleDiscoMode } = useDiscoMode();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={toggleDiscoMode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        p-2 rounded-[var(--p-border-radius-base)] 
        bg-[var(--p-color-bg-surface-secondary)]
        transition-all duration-300 ease-in-out
        relative group
        ${isDiscoMode ? 'disco-active' : ''}
      `}
      aria-label="Toggle disco mode"
    >
      <div className="relative">
        <span className={`
          text-xl
          transition-transform duration-300
          ${isDiscoMode ? 'animate-spin-slow' : ''}
          ${isHovered ? 'scale-110' : 'scale-100'}
        `}>
          🪩
        </span>
        {isHovered && !isDiscoMode && (
          <div className="absolute hidden group-hover:block z-10 w-32 p-2 mt-2 text-sm 
            text-[var(--p-color-text)] bg-[var(--p-color-bg-surface)] border 
            rounded-[var(--p-border-radius-base)] shadow-lg -left-10 top-8">
            Feel like celebrating?
          </div>
        )}
      </div>
    </button>
  );
} 