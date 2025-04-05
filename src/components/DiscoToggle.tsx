'use client';

import { useEffect, useState } from 'react';

export default function DiscoToggle() {
  const [isDiscoMode, setIsDiscoMode] = useState(false);

  useEffect(() => {
    // Apply or remove disco mode class on the body element
    if (isDiscoMode) {
      document.body.classList.add('disco-mode-active');
    } else {
      document.body.classList.remove('disco-mode-active');
    }
  }, [isDiscoMode]);

  const toggleDiscoMode = () => {
    setIsDiscoMode(!isDiscoMode);
  };

  return (
    <button
      onClick={toggleDiscoMode}
      className={`p-2 rounded-full transition-all duration-300 ${
        isDiscoMode 
          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg shadow-purple-500/30 animate-pulse' 
          : 'bg-transparent text-[var(--p-color-text-subdued)] hover:text-[var(--p-color-text)] hover:scale-110'
      }`}
      aria-label="Toggle disco mode"
      title={isDiscoMode ? "Disco mode is on" : "Click for a surprise"}
    >
      <span className={`text-lg font-bold opacity-90 ${isDiscoMode ? 'animate-spin' : 'animate-bounce-subtle'}`}>
        {isDiscoMode ? '💃' : '🕺'}
      </span>
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
      `}</style>
    </button>
  );
} 