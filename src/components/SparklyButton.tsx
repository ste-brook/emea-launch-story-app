import React, { useState, useEffect, useRef } from 'react';
import '../styles/custom.css';

interface SparklyButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const SparklyButton: React.FC<SparklyButtonProps> = ({ 
  onClick, 
  disabled = false, 
  children,
  className = ''
}) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sparkleCount = 5;
  const sparkleInterval = 2000; // ms

  // Generate random sparkles
  const generateSparkle = () => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const newSparkle = {
      id: Date.now(),
      x: Math.random() * buttonRect.width,
      y: Math.random() * buttonRect.height
    };
    
    setSparkles(prev => [...prev, newSparkle]);
    
    // Remove sparkle after animation completes
    setTimeout(() => {
      setSparkles(prev => prev.filter(sparkle => sparkle.id !== newSparkle.id));
    }, 1500);
  };

  // Set up interval for generating sparkles
  useEffect(() => {
    if (disabled) return;
    
    const interval = setInterval(() => {
      generateSparkle();
    }, sparkleInterval);
    
    return () => clearInterval(interval);
  }, [disabled]);

  // Generate initial sparkles
  useEffect(() => {
    if (disabled) return;
    
    for (let i = 0; i < sparkleCount; i++) {
      setTimeout(() => {
        generateSparkle();
      }, i * 300);
    }
  }, [disabled]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      className={`shiny-button ${className}`}
      style={{ position: 'relative' }}
    >
      {children}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="button-sparkle"
          style={{
            left: `${sparkle.x}px`,
            top: `${sparkle.y}px`
          }}
        />
      ))}
    </button>
  );
};

export default SparklyButton; 