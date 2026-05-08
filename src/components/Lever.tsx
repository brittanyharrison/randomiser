import { useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const LEVER_TRAVEL = 130;

interface Props {
  onPull: () => void;
  disabled: boolean;
}

export default function Lever({ onPull, disabled }: Props) {
  const controls = useAnimation();
  const rattleControls = useAnimation();
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  const pulledRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const triggerPull = async () => {
    if (disabled) {
      // Rattle if mid-spin
      await rattleControls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.25, ease: 'easeInOut' },
      });
      return;
    }
    onPull();
    await controls.start({
      y: LEVER_TRAVEL,
      transition: { type: 'spring', stiffness: 600, damping: 15, mass: 0.6 },
    });
    await controls.start({
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20, mass: 0.8 },
    });
  };

  const handleClick = () => {
    if (!isDragging.current) triggerPull();
  };

  // Touch/pointer drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    isDragging.current = false;
    pulledRef.current = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = async (e: React.PointerEvent) => {
    if (!dragging) return;
    const dy = e.clientY - dragStartY.current;
    if (dy > 10) isDragging.current = true;
    const clamped = Math.max(0, Math.min(dy, LEVER_TRAVEL));
    controls.set({ y: clamped });
    if (dy >= LEVER_TRAVEL * 0.6 && !pulledRef.current) {
      pulledRef.current = true;
      if (!disabled) onPull();
    }
  };

  const handlePointerUp = async () => {
    setDragging(false);
    if (disabled && !pulledRef.current) {
      await rattleControls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.25 },
      });
    }
    await controls.start({
      y: pulledRef.current ? LEVER_TRAVEL : 0,
      transition: { type: 'spring', stiffness: 400, damping: 20 },
    });
    if (pulledRef.current) {
      await controls.start({
        y: 0,
        transition: { type: 'spring', stiffness: 260, damping: 22 },
      });
    }
  };

  return (
    <motion.div
      animate={rattleControls}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        userSelect: 'none', cursor: disabled ? 'not-allowed' : 'grab',
        position: 'relative',
        width: 48,
      }}
    >
      {/* Base bracket */}
      <div style={{
        width: 40, height: 20, borderRadius: '4px 4px 0 0',
        background: 'linear-gradient(180deg, #555, #333)',
        border: '2px solid #666',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#888' }} />
      </div>

      {/* Rod container – fixed height so rod slides within it */}
      <div style={{ position: 'relative', height: LEVER_TRAVEL + 80, width: 20, overflow: 'hidden' }}>
        <motion.div
          animate={controls}
          style={{ y: 0, position: 'absolute', top: 0, left: '50%', x: '-50%', width: '100%' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
        >
          {/* Ball handle */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%', marginLeft: -10,
            background: disabled
              ? 'radial-gradient(circle at 35% 35%, #AA0000, #660000 60%, #440000)'
              : 'radial-gradient(circle at 35% 35%, #FF4444, #CC0000 60%, #880000)',
            boxShadow: disabled
              ? '0 2px 8px rgba(0,0,0,0.8)'
              : '0 0 12px rgba(255,50,50,0.6), 0 0 24px rgba(255,0,0,0.3), 0 4px 12px rgba(0,0,0,0.6)',
            border: '2px solid rgba(255,100,100,0.3)',
            transition: 'opacity 0.2s',
            opacity: disabled ? 0.6 : 1,
          }} />

          {/* Chrome rod */}
          <div style={{
            width: 10, height: LEVER_TRAVEL + 60,
            margin: '4px auto 0',
            background: 'linear-gradient(90deg, #888, #E0E0E0 30%, #C0C0C0 50%, #E8E8E8 70%, #999)',
            borderRadius: 5,
            boxShadow: '2px 0 6px rgba(0,0,0,0.4)',
          }} />
        </motion.div>
      </div>
    </motion.div>
  );
}
