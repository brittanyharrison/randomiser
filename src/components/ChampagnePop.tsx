import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bubble {
  id: number;
  x: number;
  size: number;
  delay: number;
  color: string;
}

const COLORS = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FFB347', '#DDA0DD'];

interface Props {
  active: boolean;
}

export default function ChampagnePop({ active }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    if (!active) { setBubbles([]); return; }
    const newBubbles: Bubble[] = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      size: 4 + Math.random() * 10,
      delay: Math.random() * 0.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setBubbles(newBubbles);
    const t = setTimeout(() => setBubbles([]), 2500);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 0, pointerEvents: 'none', overflow: 'visible' }}>
      <AnimatePresence>
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            initial={{ y: 0, x: `${b.x}vw`, opacity: 1, scale: 1 }}
            animate={{ y: -280 - Math.random() * 200, opacity: 0, scale: 0.3 }}
            exit={{}}
            transition={{ duration: 1.8 + Math.random() * 0.8, delay: b.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: 0,
              width: b.size, height: b.size,
              borderRadius: '50%',
              background: b.color,
              boxShadow: `0 0 ${b.size}px ${b.color}88`,
              opacity: 0.85,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
