import { useState, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Reel, Item, SpinEntry } from '../types';
import ReelComponent from './Reel';
import Lever from './Lever';
import MarqueeLights from './MarqueeLights';
import ResultBanner from './ResultBanner';
import ChampagnePop from './ChampagnePop';
import SpinHistory from './SpinHistory';
import { useSound } from '../hooks/useSound';

interface ReelResult {
  reelId: string;
  reelName: string;
  item: Item;
}

interface Props {
  reels: Reel[];
  history: SpinEntry[];
  onAddHistory: (entry: SpinEntry) => void;
  sound: ReturnType<typeof useSound>;
}

export default function PlayMode({ reels, history, onAddHistory, sound }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [spinResults, setSpinResults] = useState<(number | null)[]>(reels.map(() => null));
  const [resultBanner, setResultBanner] = useState<ReelResult[] | null>(null);
  const [champagne, setChampagne] = useState(false);
  const cabinetControls = useAnimation();
  const landedCountRef = useRef(0);
  const pendingResultsRef = useRef<Map<string, Item>>(new Map());
  const activeReelCount = useRef(0);

  const handleLeverPull = useCallback(async () => {
    if (spinning || reels.length === 0) return;

    // Reset state
    setResultBanner(null);
    setChampagne(false);
    landedCountRef.current = 0;
    pendingResultsRef.current = new Map();
    const vReels = reels.filter(r => r.items.length > 0);
    activeReelCount.current = vReels.length;

    // Pick random results for all reels
    const results = reels.map(r => r.items.length > 0 ? Math.floor(Math.random() * r.items.length) : null);
    setSpinResults(results);
    setSpinning(true);
    setSpinTrigger(t => t + 1);

    sound.playLeverClick();

    // Cabinet shudder
    cabinetControls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.25, ease: 'easeInOut' },
    });
  }, [spinning, reels, sound, cabinetControls]);

  const handleLanded = useCallback((reelId: string, item: Item) => {
    pendingResultsRef.current.set(reelId, item);
    landedCountRef.current += 1;
    sound.playReelDing(landedCountRef.current - 1);

    if (landedCountRef.current >= activeReelCount.current) {
      // All reels landed
      const finalResults: ReelResult[] = reels
        .filter(r => pendingResultsRef.current.has(r.id))
        .map(r => ({
          reelId: r.id,
          reelName: r.name,
          item: pendingResultsRef.current.get(r.id)!,
        }));
      setResultBanner(finalResults);
      setSpinning(false);
      setChampagne(true);
      sound.playFanfare();

      const entry: SpinEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        results: finalResults,
      };
      onAddHistory(entry);
    }
  }, [reels, sound, onAddHistory]);

  const validReels = reels.filter(r => r.items.length > 0);

  return (
    <div style={{ paddingTop: 80, paddingBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Machine cabinet */}
      <motion.div
        animate={cabinetControls}
        style={{
          width: '100%', maxWidth: 1100,
          background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 30%, #141414 60%, #1c1c1c 100%)',
          borderRadius: 20,
          border: '4px solid #3a3a3a',
          boxShadow: `
            0 0 0 2px #222,
            0 0 30px rgba(255,36,36,0.2),
            0 0 60px rgba(255,230,0,0.1),
            0 0 100px rgba(255,36,36,0.08),
            0 20px 60px rgba(0,0,0,0.9),
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -2px 0 rgba(0,0,0,0.5)
          `,
          padding: '0 0 20px',
          position: 'relative',
          margin: '0 16px',
        }}
      >
        {/* Neon tube glow along frame */}
        <div style={{
          position: 'absolute', inset: -4, borderRadius: 22,
          pointerEvents: 'none',
          boxShadow: `
            0 0 15px 3px rgba(255,36,36,0.4),
            0 0 30px 6px rgba(255,230,0,0.2),
            inset 0 0 15px 3px rgba(255,36,36,0.15)
          `,
        }} />

        {/* Top marquee lights row */}
        <div style={{
          height: 20, borderRadius: '16px 16px 0 0',
          background: 'linear-gradient(180deg, #222, #1a1a1a)',
          borderBottom: '2px solid #333',
          overflow: 'hidden',
        }}>
          <MarqueeLights horizontal count={28} />
        </div>

        {/* Machine title bar */}
        <div style={{
          textAlign: 'center', padding: '12px 20px 8px',
          borderBottom: '2px solid rgba(255,215,0,0.2)',
        }}>
          <div style={{
            fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 8,
            background: 'linear-gradient(180deg, #FFE57A, #FFD700 40%, #B8860B 80%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.8))',
          }}>
            ✦ LUCKY BLOOM ✦
          </div>
          <div style={{
            fontFamily: 'Oswald', fontSize: 11, color: '#888', letterSpacing: 4, textTransform: 'uppercase',
          }}>
            Las Vegas Style Randomiser
          </div>
        </div>

        {/* Main content: reels + lever */}
        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '20px 16px 12px', gap: 12 }}>
          {/* Side light strip left */}
          <div style={{ width: 16, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
            <MarqueeLights count={12} horizontal={false} />
          </div>

          {/* Reels area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Chrome inner bezel */}
            <div style={{
              background: 'linear-gradient(180deg, #111, #0a0a0a)',
              border: '3px solid #333',
              borderRadius: 12,
              padding: '20px 12px',
              boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.8), inset 0 -2px 8px rgba(0,0,0,0.4)',
              position: 'relative',
            }}>
              {/* Gold inner accent */}
              <div style={{
                position: 'absolute', inset: 3, borderRadius: 9, pointerEvents: 'none',
                border: '1px solid rgba(255,215,0,0.15)',
              }} />

              {validReels.length === 0 ? (
                <div style={{
                  fontFamily: 'Oswald', color: '#555', textAlign: 'center',
                  padding: '40px 20px', fontSize: 16,
                }}>
                  No reels configured. Switch to Edit Mode to add categories.
                </div>
              ) : (
                <div className="reel-grid">
                  {validReels.map((reel, idx) => (
                    <div key={reel.id}>
                      <ReelComponent
                        reel={reel}
                        spinTrigger={spinTrigger}
                        spinResultIndex={spinResults[reels.indexOf(reel)] ?? null}
                        staggerIndex={idx}
                        onLanded={(id, item) => handleLanded(id, item)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side light strip right */}
          <div style={{ width: 16, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
            <MarqueeLights count={12} horizontal={false} />
          </div>

          {/* Lever */}
          <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 20 }}>
            <Lever onPull={handleLeverPull} disabled={spinning} />
          </div>
        </div>

        {/* Bottom marquee lights row */}
        <div style={{
          height: 20, margin: '0 0 0',
          borderTop: '2px solid #333',
          overflow: 'hidden',
        }}>
          <MarqueeLights horizontal count={28} />
        </div>

        {/* Champagne pop — attached to bottom of cabinet */}
        <ChampagnePop active={champagne} />
      </motion.div>

      {/* Result banner */}
      <div style={{ width: '100%', maxWidth: 1100, padding: '0 16px' }}>
        <ResultBanner results={resultBanner} />
      </div>

      {/* Spin history */}
      <div style={{ width: '100%', maxWidth: 1100 }}>
        <SpinHistory history={history} />
      </div>
    </div>
  );
}
