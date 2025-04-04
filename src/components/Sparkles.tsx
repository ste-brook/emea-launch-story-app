'use client';

import { useEffect, useState } from 'react';

interface SparkleProps {
  size: number;
  color: string;
  style: React.CSSProperties;
}

const Sparkle = ({ size, color, style }: SparkleProps) => {
  const path = `
    M${size / 2} 0
    L${size * 0.4} ${size * 0.4}
    L0 ${size / 2}
    L${size * 0.4} ${size * 0.6}
    L${size / 2} ${size}
    L${size * 0.6} ${size * 0.6}
    L${size} ${size / 2}
    L${size * 0.6} ${size * 0.4}
    Z
  `;

  return (
    <span style={style}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={path} fill={color} />
      </svg>
    </span>
  );
};

interface SparklesProps {
  isActive: boolean;
}

export function Sparkles({ isActive }: SparklesProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; createdAt: number; color: string; size: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    if (!isActive) {
      setSparkles([]);
      return;
    }

    const generateSparkle = () => {
      const id = Math.random();
      const now = Date.now();
      const color = `hsl(${Math.random() * 360}, 100%, 75%)`;
      const size = Math.random() * 20 + 10;
      const style = {
        position: 'absolute' as const,
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        zIndex: 2,
        pointerEvents: 'none' as const,
        animation: `sparkle-fade 1.5s ease-in-out forwards`,
      };

      return { id, createdAt: now, color, size, style };
    };

    const interval = setInterval(() => {
      setSparkles((prevSparkles) => {
        const now = Date.now();
        const newSparkles = prevSparkles.filter((sparkle) => now - sparkle.createdAt < 1500);
        return [...newSparkles, generateSparkle()];
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style jsx global>{`
        @keyframes sparkle-fade {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          size={sparkle.size}
          color={sparkle.color}
          style={sparkle.style}
        />
      ))}
    </div>
  );
} 