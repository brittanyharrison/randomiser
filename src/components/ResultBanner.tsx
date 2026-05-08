import { motion, AnimatePresence } from 'framer-motion';
import type { Item } from '../types';
import { COLOUR_MAP } from '../data/defaults';

interface ReelResult {
  reelId: string;
  reelName: string;
  item: Item;
}

interface Props {
  results: ReelResult[] | null;
}

export default function ResultBanner({ results }: Props) {
  return (
    <AnimatePresence>
      {results && (
        <motion.div
          key="banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            margin: '20px auto 0',
            maxWidth: 900,
            width: '100%',
            background: 'linear-gradient(135deg, #0d0d00, #1a1600)',
            border: '3px solid #FFD700',
            borderRadius: 12,
            padding: '16px 24px',
            boxShadow: '0 0 20px rgba(255,215,0,0.3), 0 0 60px rgba(255,215,0,0.1), 0 8px 32px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{
            fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 4,
            color: '#FFD700', textAlign: 'center', marginBottom: 14,
            textShadow: '0 0 12px rgba(255,215,0,0.7)',
          }}>
            ✦ WINNING COMBINATION ✦
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
          }}>
            {results.map(r => {
              const isColour = r.reelId === 'colour' || r.reelName.toLowerCase() === 'colour';
              const colour = isColour ? COLOUR_MAP[r.item.name.toLowerCase()] : null;
              return (
                <div key={r.reelId} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: 'rgba(255,215,0,0.05)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  borderRadius: 8, padding: '8px 14px', minWidth: 90,
                }}>
                  <span style={{ fontFamily: 'Oswald', fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {r.reelName}
                  </span>
                  {colour && (
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: colour,
                      boxShadow: `0 0 8px ${colour}88`,
                      border: '2px solid rgba(255,255,255,0.2)',
                    }} />
                  )}
                  <span style={{ fontFamily: 'Oswald', fontSize: 14, fontWeight: 600, color: '#FFD700', textAlign: 'center' }}>
                    {r.item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
