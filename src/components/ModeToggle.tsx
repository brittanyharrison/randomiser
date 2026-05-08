import { motion } from 'framer-motion';

interface Props {
  mode: 'play' | 'edit';
  onToggle: () => void;
}

export default function ModeToggle({ mode, onToggle }: Props) {
  return (
    <motion.button
      onClick={onToggle}
      title={mode === 'play' ? 'Open Edit Mode' : 'Back to Play Mode'}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      style={{
        position: 'fixed', top: 20, left: 20, zIndex: 200,
        width: 56, height: 56, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #FFE57A, #FFD700 45%, #B8860B 80%, #8B6914)',
        border: '3px solid #FFD700',
        boxShadow: '0 0 12px rgba(255,215,0,0.5), 0 0 30px rgba(255,215,0,0.2), inset 0 2px 4px rgba(255,255,200,0.6), 0 4px 12px rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
        cursor: 'pointer',
      }}
    >
      <motion.span
        key={mode}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {mode === 'play' ? '🔧' : '🎰'}
      </motion.span>
    </motion.button>
  );
}
