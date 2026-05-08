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
  machineName: string;
}

export default function PlayMode({ reels, history, onAddHistory, sound, machineName }: Props) {
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

      {/* ── Outer chrome frame ── */}
      <motion.div
        animate={cabinetControls}
        style={{
          width: '100%', maxWidth: 1100,
          /* Gold/chrome gradient background shows through as the frame border */
          background: 'linear-gradient(160deg, #E8C84A 0%, #8B6508 18%, #FFD700 32%, #C8960C 48%, #8B6508 62%, #D4A017 78%, #FFD700 100%)',
          borderRadius: 26,
          padding: 7,
          position: 'relative',
          margin: '0 16px',
          boxShadow: `
            0 0 55px 12px rgba(255,36,36,0.65),
            0 0 110px 24px rgba(255,215,0,0.4),
            0 0 180px 48px rgba(255,36,36,0.2),
            0 50px 120px rgba(0,0,0,0.98),
            inset 0 2px 0 rgba(255,255,255,0.45)
          `,
        }}
      >
        {/* Corner rivets */}
        {[{ top: 10, left: 10 }, { top: 10, right: 10 }, { bottom: 10, left: 10 }, { bottom: 10, right: 10 }].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', ...pos, width: 14, height: 14, borderRadius: '50%', zIndex: 20,
            background: 'radial-gradient(circle at 35% 35%, #FFF8DC, #DAA520 50%, #8B6508)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.3)',
          }} />
        ))}

        {/* ── Inner cabinet body ── */}
        <div style={{
          borderRadius: 20,
          background: 'linear-gradient(180deg, #323232 0%, #1e1e1e 12%, #141414 45%, #181818 78%, #242424 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inset neon glow on cabinet walls */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', zIndex: 1,
            boxShadow: `
              inset 0 0 40px 8px rgba(255,36,36,0.28),
              inset 0 0 80px 16px rgba(255,215,0,0.14),
              inset 0 0 4px 1px rgba(255,36,36,0.5)
            `,
          }} />

          {/* Top marquee strip */}
          <div style={{
            height: 24, background: 'linear-gradient(180deg, #1a1a1a, #111)',
            borderBottom: '2px solid rgba(255,215,0,0.25)', overflow: 'hidden', position: 'relative', zIndex: 2,
          }}>
            <MarqueeLights horizontal count={30} />
          </div>

          {/* ── Title panel ── */}
          <div style={{
            textAlign: 'center', padding: '22px 24px 14px', position: 'relative', zIndex: 2,
            borderBottom: '3px solid rgba(255,215,0,0.25)',
            background: 'linear-gradient(180deg, rgba(255,215,0,0.07) 0%, transparent 100%)',
          }}>
            {/* Decorative side lines */}
            <div style={{
              position: 'absolute', left: 24, right: 24, top: '50%',
              height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.35) 20%, rgba(255,215,0,0.35) 80%, transparent)',
              pointerEvents: 'none',
            }} />
            <div style={{
              fontFamily: 'Bebas Neue',
              fontSize: 'clamp(52px, 7.5vw, 100px)',
              letterSpacing: '0.14em',
              lineHeight: 1,
              position: 'relative',
              background: 'linear-gradient(180deg, #FFFDE7 0%, #FFE566 20%, #FFD700 45%, #DAA520 68%, #B8860B 88%, #8B6508 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 18px rgba(255,215,0,0.95)) drop-shadow(0 0 40px rgba(255,180,0,0.7)) drop-shadow(0 4px 8px rgba(0,0,0,0.9))',
            }}>
              ✦ {machineName || 'LUCKY BLOOM'} ✦
            </div>
            <div style={{
              fontFamily: 'Oswald', fontSize: 13, letterSpacing: '0.45em',
              textTransform: 'uppercase', marginTop: 6,
              color: 'transparent',
              background: 'linear-gradient(90deg, #888, #C8960C, #888)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Las Vegas Style Randomiser
            </div>
          </div>

          {/* ── Main body: side strips + reel bezel + lever ── */}
          <div style={{ display: 'flex', alignItems: 'stretch', padding: '18px 14px 14px', gap: 10, position: 'relative', zIndex: 2 }}>

            {/* Left light strip */}
            <div style={{ width: 18, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <MarqueeLights count={14} horizontal={false} />
            </div>

            {/* Reel bezel — chrome outer ring + inset dark well */}
            <div style={{
              flex: 1, minWidth: 0,
              background: 'linear-gradient(145deg, #4a4a4a 0%, #2a2a2a 15%, #1a1a1a 50%, #2a2a2a 85%, #3a3a3a 100%)',
              border: '4px solid transparent',
              borderRadius: 16,
              backgroundClip: 'padding-box',
              boxShadow: `
                0 0 0 4px #1a1a1a,
                0 0 0 5px rgba(255,215,0,0.5),
                inset 0 6px 24px rgba(0,0,0,0.9),
                inset 0 -3px 12px rgba(0,0,0,0.6),
                inset 0 0 60px rgba(0,0,0,0.4)
              `,
              padding: '18px 10px',
              position: 'relative',
            }}>
              {/* Gold accent ring */}
              <div style={{
                position: 'absolute', inset: 4, borderRadius: 12, pointerEvents: 'none',
                border: '1px solid rgba(255,215,0,0.2)',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
              }} />
              {/* Top shine on bezel glass */}
              <div style={{
                position: 'absolute', top: 4, left: 4, right: 4, height: '35%',
                borderRadius: '12px 12px 0 0', pointerEvents: 'none',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent)',
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

            {/* Right light strip */}
            <div style={{ width: 18, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <MarqueeLights count={14} horizontal={false} />
            </div>

            {/* Lever mount panel */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', paddingTop: 18, flexShrink: 0,
              background: 'linear-gradient(180deg, #2a2a2a, #1a1a1a)',
              borderRadius: 10,
              border: '2px solid #333',
              padding: '18px 8px 12px',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.7)',
            }}>
              <Lever onPull={handleLeverPull} disabled={spinning} />
            </div>
          </div>

          {/* Coin tray accent */}
          <div style={{
            margin: '0 14px 14px', height: 12, borderRadius: 6, position: 'relative', zIndex: 2,
            background: 'linear-gradient(180deg, #1a1a1a, #111)',
            border: '1px solid rgba(255,215,0,0.15)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
          }}>
            <div style={{
              position: 'absolute', left: '30%', right: '30%', top: 3, bottom: 3,
              borderRadius: 4, background: 'rgba(255,215,0,0.06)',
              border: '1px solid rgba(255,215,0,0.1)',
            }} />
          </div>

          {/* Bottom marquee strip */}
          <div style={{
            height: 24, background: 'linear-gradient(180deg, #111, #1a1a1a)',
            borderTop: '2px solid rgba(255,215,0,0.25)', overflow: 'hidden', position: 'relative', zIndex: 2,
          }}>
            <MarqueeLights horizontal count={30} />
          </div>

          <ChampagnePop active={champagne} />
        </div>
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
