'use client';

import { useState, useEffect } from 'react';

export function useDiscoMode() {
  const [isDiscoMode, setIsDiscoMode] = useState(false);

  useEffect(() => {
    if (isDiscoMode) {
      document.documentElement.classList.add('disco-mode');
    } else {
      document.documentElement.classList.remove('disco-mode');
    }
  }, [isDiscoMode]);

  const toggleDiscoMode = () => {
    setIsDiscoMode(prev => !prev);
  };

  return { isDiscoMode, toggleDiscoMode };
} 