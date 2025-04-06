'use client';

import { useState, useEffect } from 'react';
import { User, UserRound } from 'lucide-react';

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
      {isActive ? (
        <UserRound className="w-5 h-5 text-[var(--p-color-text)] animate-[dance_1s_ease-in-out_infinite]" />
      ) : (
        <User className="w-5 h-5 text-[var(--p-color-text)] animate-[wiggle_2s_ease-in-out_infinite]" />
      )}
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