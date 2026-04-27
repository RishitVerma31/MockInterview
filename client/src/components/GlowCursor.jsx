import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function GlowCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const hideCursor = () => setIsVisible(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseleave', hideCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseleave', hideCursor);
    };
  }, []);

  return (
    <>
      {/* Main cursor glow */}
      <motion.div
        style={{
          position: 'fixed',
          left: cursorXSpring,
          top: cursorYSpring,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,106,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />
      
      {/* Inner cursor dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: cursorXSpring,
          top: cursorYSpring,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'rgba(124,106,247,0.6)',
          pointerEvents: 'none',
          zIndex: 10000,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          boxShadow: '0 0 20px rgba(124,106,247,0.8)',
        }}
      />
    </>
  );
}
