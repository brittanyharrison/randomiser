import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSound } from './hooks/useSound';
import { DEFAULT_REELS } from './data/defaults';
import type { Reel, SpinEntry } from './types';
import PlayMode from './components/PlayMode';
import EditMode from './components/EditMode';
import ModeToggle from './components/ModeToggle';

export default function App() {
  const [mode, setMode] = useState<'play' | 'edit'>('play');
  const [reels, setReels] = useLocalStorage<Reel[]>('slot-reels', DEFAULT_REELS);
  const [history, setHistory] = useLocalStorage<SpinEntry[]>('slot-history', []);
  const sound = useSound();
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => {
    const on = sound.toggle();
    setSoundOn(on);
  };

  const addHistory = (entry: SpinEntry) => {
    setHistory(prev => [entry, ...prev].slice(0, 5));
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 0%, #0a2a0a 0%, #060D06 60%)',
      }} />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        boxShadow: 'inset 0 0 150px 30px rgba(255,36,36,0.08), inset 0 0 250px 60px rgba(255,230,0,0.04)',
      }} />

      <ModeToggle mode={mode} onToggle={() => setMode(m => m === 'play' ? 'edit' : 'play')} />

      <button
        onClick={toggleSound}
        title={soundOn ? 'Mute' : 'Unmute'}
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 200,
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
          border: `2px solid ${soundOn ? '#555' : '#333'}`,
          color: soundOn ? '#FFD700' : '#444',
          fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
          transition: 'all 0.2s',
        }}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>

      <AnimatePresence mode="wait">
        {mode === 'play' ? (
          <motion.div
            key="play"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <PlayMode reels={reels} history={history} onAddHistory={addHistory} sound={sound} />
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <EditMode reels={reels} setReels={setReels} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
