import type { CSSProperties } from 'react';

const COLOURS = ['#FF2424', '#FFE600', '#FFFFFF', '#FF2424', '#FFE600', '#FF88FF', '#FFFFFF', '#FFE600'];

interface Props {
  count?: number;
  horizontal?: boolean;
}

export default function MarqueeLights({ count = 18, horizontal = false }: Props) {
  const bulbs = Array.from({ length: count }, (_, i) => i);
  return (
    <div style={{
      display: 'flex',
      flexDirection: horizontal ? 'row' : 'column',
      gap: horizontal ? 0 : 0,
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: horizontal ? '4px 0' : '0 4px',
      width: horizontal ? '100%' : 'auto',
      height: horizontal ? 'auto' : '100%',
    }}>
      {bulbs.map(i => {
        const color = COLOURS[i % COLOURS.length];
        const delay = (i * 0.12) % 1.1;
        const style: CSSProperties = {
          width: 8, height: 8, borderRadius: '50%',
          background: color,
          flexShrink: 0,
          animation: `bulb-blink ${0.9 + (i % 3) * 0.2}s ${delay}s ease-in-out infinite`,
          color,
        };
        return <div key={i} style={style} />;
      })}
    </div>
  );
}
