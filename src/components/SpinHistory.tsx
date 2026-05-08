import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpinEntry } from '../types';

interface Props {
  history: SpinEntry[];
}

export default function SpinHistory({ history }: Props) {
  const [open, setOpen] = useState(false);

  const fmt = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ margin: '24px auto 40px', maxWidth: 900, width: '100%', padding: '0 16px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #1a1400, #0d0d00)',
          border: '2px solid rgba(255,215,0,0.4)',
          borderRadius: open ? '10px 10px 0 0' : 10,
          padding: '12px 20px',
          color: '#FFD700',
          fontFamily: 'Bebas Neue',
          fontSize: 18,
          letterSpacing: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        <span>⟳ RECENT SPINS ({history.length})</span>
        <span style={{ fontSize: 14, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #0d0d00, #0a0a00)',
              border: '2px solid rgba(255,215,0,0.3)',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              padding: '12px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {history.length === 0 ? (
                <p style={{ fontFamily: 'Oswald', color: '#555', textAlign: 'center', fontSize: 14 }}>
                  No spins yet — pull the lever!
                </p>
              ) : history.map((entry, ei) => (
                <div key={entry.id} style={{
                  background: 'rgba(255,215,0,0.04)',
                  border: '1px solid rgba(255,215,0,0.15)',
                  borderRadius: 8, padding: '10px 14px',
                }}>
                  <div style={{
                    fontFamily: 'Oswald', fontSize: 11, color: '#888',
                    marginBottom: 8, letterSpacing: 1,
                  }}>
                    Spin #{history.length - ei} — {fmt(entry.timestamp)}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {entry.results.map(r => (
                      <div key={r.reelId} style={{
                        fontFamily: 'Oswald', fontSize: 12,
                        color: '#FFD700', letterSpacing: 0.5,
                        background: 'rgba(255,215,0,0.07)',
                        padding: '3px 8px', borderRadius: 4,
                      }}>
                        <span style={{ color: '#888', marginRight: 4 }}>{r.reelName}:</span>
                        {r.item.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
