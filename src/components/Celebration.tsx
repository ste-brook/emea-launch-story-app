'use client';

import { useEffect, useState } from 'react';

interface Confetti {
  id: number;
  color: string;
  style: React.CSSProperties;
}

interface ConfettiProps {
  style: React.CSSProperties;
  color: string;
}

function Confetti({ style, color }: ConfettiProps) {
  // Randomly choose between different confetti shapes
  const shape = Math.random() > 0.5 ? 'circle' : 'square';
  
  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : '0',
        zIndex: 10,
        pointerEvents: 'none',
        animation: `confetti-fall ${style.animationDuration} linear forwards`,
        boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      }}
    />
  );
}

interface CelebrationProps {
  isActive: boolean;
  consultantName: string;
}

export function Celebration({ isActive, consultantName }: CelebrationProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'];

  useEffect(() => {
    if (isActive) {
      // Generate confetti across the entire viewport
      const interval = setInterval(() => {
        // Create multiple confetti particles at once for a denser effect
        const newConfettiParticles = Array.from({ length: 5 }, () => {
          const size = Math.random() * 10 + 5; // Random size between 5-15px
          return {
            id: Date.now() + Math.random(),
            style: {
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDuration: `${1 + Math.random() * 3}s`,
              width: `${size}px`,
              height: `${size}px`,
            },
            color: colors[Math.floor(Math.random() * colors.length)],
          };
        });
        
        setConfetti((prev) => [...prev, ...newConfettiParticles]);
      }, 50); // Generate new confetti more frequently

      // Show message after a short delay
      const messageTimer = setTimeout(() => {
        setShowMessage(true);
      }, 500);

      // Clean up
      return () => {
        clearInterval(interval);
        clearTimeout(messageTimer);
      };
    } else {
      setConfetti([]);
      setShowMessage(false);
    }
  }, [isActive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .celebration-message {
          animation: message-appear 0.5s ease-out forwards;
        }
        
        @keyframes message-appear {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        .overlay {
          animation: overlay-appear 0.3s ease-out forwards;
        }
        
        @keyframes overlay-appear {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
      
      {confetti.map((c) => (
        <Confetti key={c.id} style={c.style} color={c.color} />
      ))}
      
      {showMessage && (
        <>
          <div className="overlay fixed inset-0 bg-[var(--p-color-bg-overlay)] z-40"></div>
          <div className="celebration-message fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--p-color-bg-surface)] p-[var(--p-space-8)] rounded-[var(--p-border-radius-base)] shadow-[var(--p-shadow-lg)] border border-[var(--p-color-border-success)] max-w-md text-center z-50">
            <div className="text-5xl mb-[var(--p-space-4)]">🎉</div>
            <h3 className="text-2xl font-bold text-[var(--p-color-text)] mb-[var(--p-space-3)]">
              {consultantName ? `Congratulations, ${consultantName}!` : 'Congratulations!'}
            </h3>
            <p className="text-[var(--p-color-text-subdued)] text-lg">
              Your story has been successfully submitted. Thank you for sharing your success with the team!
            </p>
          </div>
        </>
      )}
    </div>
  );
} 