'use client';

import React, { useState, useEffect } from 'react';
import { useDiscoMode } from '@/hooks/useDiscoMode';

export default function DiscoButton() {
  const { isDiscoMode, toggleDiscoMode } = useDiscoMode();
  const [isHovered, setIsHovered] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [hasEverEnabledDisco, setHasEverEnabledDisco] = useState(false);

  // Check if disco has ever been enabled on mount
  useEffect(() => {
    const hasEnabled = localStorage.getItem('hasEverEnabledDisco') === 'true';
    setHasEverEnabledDisco(hasEnabled);
  }, []);

  // Handle disco mode changes
  useEffect(() => {
    if (isDiscoMode && !hasEverEnabledDisco) {
      setHasEverEnabledDisco(true);
      localStorage.setItem('hasEverEnabledDisco', 'true');
    }
  }, [isDiscoMode, hasEverEnabledDisco]);

  // Peek animation effect
  useEffect(() => {
    if (isDiscoMode || hasEverEnabledDisco) return; // Don't peek if disco mode is active or has been used

    const peekInterval = setInterval(() => {
      setIsPeeking(true);
      setTimeout(() => setIsPeeking(false), 600);
    }, 5000);

    return () => clearInterval(peekInterval);
  }, [isDiscoMode, hasEverEnabledDisco]);

  return (
    <button
      onClick={toggleDiscoMode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group p-2 rounded-[var(--p-border-radius-base)]"
      aria-label="Toggle disco mode"
    >
      <div className="relative">
        <span className="text-xl">
          {isDiscoMode ? '😎' : '⚪'}
        </span>
        {isHovered && !isDiscoMode && (
          <div className="absolute hidden group-hover:block z-10 w-32 p-2 mt-2 text-sm 
            text-[var(--p-color-text)] bg-[var(--p-color-bg-surface)] border 
            rounded-[var(--p-border-radius-base)] shadow-lg -left-10 top-8">
            Ready to party?
          </div>
        )}
      </div>
    </button>
  );
} 