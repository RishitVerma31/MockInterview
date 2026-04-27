import React from 'react';
import { motion } from 'framer-motion';

const shapes = [
  { type: 'circle', size: 120, top: '10%', left: '8%', color: 'rgba(124,106,247,0.15)', delay: 0 },
  { type: 'square', size: 80, top: '20%', right: '10%', color: 'rgba(34,211,238,0.12)', delay: 1 },
  { type: 'triangle', size: 60, bottom: '15%', left: '12%', color: 'rgba(244,114,182,0.1)', delay: 2 },
  { type: 'hexagon', size: 100, bottom: '20%', right: '8%', color: 'rgba(74,222,128,0.08)', delay: 0.5 },
  { type: 'circle', size: 140, top: '50%', left: '5%', color: 'rgba(167,139,250,0.1)', delay: 1.5 },
  { type: 'square', size: 70, top: '60%', right: '15%', color: 'rgba(251,146,60,0.12)', delay: 0.8 },
];

export default function FloatingShapes() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: shape.delay },
            scale: { duration: 0.6, delay: shape.delay },
            y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 8 + i, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            position: 'absolute',
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: shape.left,
            right: shape.right,
            bottom: shape.bottom,
            background: shape.color,
            borderRadius: shape.type === 'circle' ? '50%' : shape.type === 'square' ? '20%' : '10%',
            border: `1px solid ${shape.color.replace('0.1', '0.2')}`,
            backdropFilter: 'blur(2px)',
            boxShadow: `0 0 40px ${shape.color}`,
          }}
        />
      ))}
    </div>
  );
}
