'use client';

import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

interface DiscoModeProps {
  isActive: boolean;
  onToggle: () => void;
}

export function DiscoMode({ isActive, onToggle }: DiscoModeProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-[var(--p-border-radius-base)] bg-[var(--p-color-bg-surface-secondary)] transition-all duration-300 ${
        isActive ? 'text-purple-500' : ''
      }`}
      title="Toggle Disco Mode"
      aria-label="Toggle Disco Mode"
    >
      <Music className={`w-5 h-5 text-[var(--p-color-text)] ${isActive ? 'animate-spin' : ''}`} />
    </button>
  );
}

export function DiscoEffect({ isActive }: { isActive: boolean }) {
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('disco-mode');
    } else {
      document.body.classList.remove('disco-mode');
    }

    return () => {
      document.body.classList.remove('disco-mode');
    };
  }, [isActive]);

  return null;
} 