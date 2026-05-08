import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Item, Reel as ReelType } from '../types';
import { COLOUR_MAP } from '../data/defaults';

const ITEM_H = 172; // image(120) + name(32) + gap(20)
const STRIP_REPEATS = 30;
const RESET_REPEAT = 8;

interface Props {
  reel: ReelType;
  spinTrigger: number;
  spinResultIndex: number | null;
  staggerIndex: number;
  onLanded: (reelId: string, item: Item) => void;
}

function ItemCell({ item, isColour }: { item: Item; isColour?: boolean }) {
  const [imgError, setImgError] = useState(false);

  if (isColour) {
    const colour = COLOUR_MAP[item.name.toLowerCase()] ?? '#888';
    return (
      <div style={{
        width: '100%', height: ITEM_H, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: colour,
          boxShadow: `0 0 20px ${colour}88, 0 0 40px ${colour}44, inset 0 2px 8px rgba(255,255,255,0.3)`,
          border: '3px solid rgba(255,255,255,0.2)',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'Oswald', fontSize: 13, fontWeight: 500,
          color: '#FFD700', textTransform: 'uppercase', letterSpacing: 1,
        }}>{item.name}</span>
      </div>
    );
  }

  const hasImage = item.image && !imgError;
  return (
    <div style={{
      width: '100%', height: ITEM_H, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {hasImage ? (
        <img
          src={item.image}
          alt={item.name}
          onError={() => setImgError(true)}
          style={{
            width: 120, height: 120, objectFit: 'cover', borderRadius: 8,
            border: '2px solid rgba(255,215,0,0.3)',
            flexShrink: 0,
          }}
        />
      ) : (
        <div style={{
          width: 120, height: 120, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #1a1400, #2a2200)',
          border: '2px solid rgba(255,215,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 4,
        }}>
          <span style={{ fontSize: 28 }}>🌸</span>
          <span style={{
            fontFamily: 'Oswald', fontSize: 9, color: '#DAA520',
            textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', padding: '0 4px',
          }}>{item.name}</span>
        </div>
      )}
      <span style={{
        fontFamily: 'Oswald', fontSize: 12, fontWeight: 500,
        color: '#FFD700', textTransform: 'uppercase', letterSpacing: 0.8,
        textAlign: 'center', maxWidth: 130, lineHeight: 1.2,
      }}>{item.name}</span>
    </div>
  );
}

export default function Reel({ reel, spinTrigger, spinResultIndex, staggerIndex, onLanded }: Props) {
  const items = reel.items;
  const totalItems = items.length;
  const controls = useAnimation();
  const stripIndexRef = useRef(RESET_REPEAT * totalItems);
  const isSpinningRef = useRef(false);

  const stripItems = useMemo(() => {
    return Array(STRIP_REPEATS).fill(null).flatMap(() => items);
  }, [items]);

  // Reset strip position when items change
  useEffect(() => {
    stripIndexRef.current = RESET_REPEAT * totalItems;
    controls.set({ y: -(RESET_REPEAT * totalItems * ITEM_H) });
  }, [items, totalItems, controls]);

  useEffect(() => {
    if (spinResultIndex === null || spinTrigger === 0) return;

    const spin = async () => {
      isSpinningRef.current = true;
      const currentIdx = stripIndexRef.current;
      const currentMod = currentIdx % totalItems;
      const distToTarget = (spinResultIndex - currentMod + totalItems) % totalItems;
      // Travel 3 full rotations + distance to target item
      const extraRotations = 3 + staggerIndex;
      const targetIdx = currentIdx + extraRotations * totalItems + (distToTarget === 0 ? totalItems : distToTarget);
      const finalY = -(targetIdx * ITEM_H);
      const overshootY = finalY - ITEM_H * 0.14;

      const spinDuration = 2.8 + staggerIndex * 0.38;

      // Phase 1: fast spin with deceleration to slight overshoot
      await controls.start({
        y: overshootY,
        transition: { duration: spinDuration, ease: [0.08, 0.0, 0.15, 1.0] },
      });

      // Phase 2: spring back to exact position
      await controls.start({
        y: finalY,
        transition: { type: 'spring', stiffness: 380, damping: 28, mass: 0.7 },
      });

      // Invisible reset to keep strip position from growing indefinitely
      const recycledIdx = spinResultIndex + RESET_REPEAT * totalItems;
      stripIndexRef.current = recycledIdx;
      controls.set({ y: -(recycledIdx * ITEM_H) });

      isSpinningRef.current = false;
      onLanded(reel.id, items[spinResultIndex]);
    };

    spin();
  }, [spinTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Reel label */}
      <div style={{
        fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 2,
        color: '#FFD700', textTransform: 'uppercase',
        textShadow: '0 0 8px rgba(255,215,0,0.6)',
      }}>
        {reel.name}
      </div>

      {/* Reel window */}
      <div style={{
        width: 148,
        height: ITEM_H,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 10,
        background: 'linear-gradient(180deg, #0a0a0a, #111)',
        border: '3px solid #333',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.05)',
      }}>
        {/* Glass lens top/bottom fade */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.7) 100%)',
          borderRadius: 8,
        }} />
        {/* Shine overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          zIndex: 11, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
          borderRadius: '8px 8px 0 0',
        }} />
        {/* Horizontal centre line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, zIndex: 12, pointerEvents: 'none',
          top: '50%', transform: 'translateY(-50%)',
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)',
        }} />

        <motion.div animate={controls} style={{ y: -(stripIndexRef.current * ITEM_H) }}>
          {stripItems.map((item, i) => (
            <ItemCell key={`${item.id}-${i}`} item={item} isColour={reel.isColour} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
