import { useState, useRef } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import type { Reel, Item } from '../types';
import { getStorageUsage } from '../hooks/useLocalStorage';
import { COLOUR_MAP } from '../data/defaults';

const GOLD = '#FFD700';
const MAX_IMG_PX = 300;

function uid() { return Math.random().toString(36).slice(2); }

async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_IMG_PX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function StorageBar() {
  const bytes = getStorageUsage();
  const mb = bytes / 1024 / 1024;
  const max = 5;
  const pct = Math.min(100, (mb / max) * 100);
  const warn = pct > 80;
  return (
    <div style={{ margin: '0 0 20px', padding: '10px 14px', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'Oswald', fontSize: 12, color: '#888', letterSpacing: 1, textTransform: 'uppercase' }}>Storage Used</span>
        <span style={{ fontFamily: 'Oswald', fontSize: 12, color: warn ? '#FF6B6B' : GOLD }}>
          {mb.toFixed(2)} MB / {max} MB
        </span>
      </div>
      <div style={{ height: 4, background: '#222', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: warn ? '#FF6B6B' : GOLD, borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
      {warn && (
        <p style={{ fontFamily: 'Oswald', fontSize: 11, color: '#FF6B6B', marginTop: 6 }}>
          Storage almost full. Consider removing items or switching to URL references instead of uploads.
        </p>
      )}
    </div>
  );
}

interface ItemRowProps {
  item: Item;
  isColour?: boolean;
  onDelete: () => void;
  onUpdate: (updated: Item) => void;
}

function ItemRow({ item, isColour, onDelete, onUpdate }: ItemRowProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(item.name);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const [imgInput, setImgInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const saveName = () => {
    if (nameVal.trim()) onUpdate({ ...item, name: nameVal.trim() });
    setEditingName(false);
  };

  const handleFile = async (f: File) => {
    try {
      const data = await resizeImage(f);
      setImgPreview(data);
      onUpdate({ ...item, image: data });
    } catch { /* ignore */ }
  };

  const handleUrlSave = () => {
    if (imgInput.trim()) {
      onUpdate({ ...item, image: imgInput.trim() });
      setImgPreview(imgInput.trim());
      setImgInput('');
    }
  };

  const colour = isColour ? COLOUR_MAP[item.name.toLowerCase()] : null;
  const thumb = imgPreview ?? item.image;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px',
      background: 'rgba(255,255,255,0.02)', borderRadius: 6,
      border: '1px solid rgba(255,215,0,0.1)',
    }}>
      {/* Thumbnail */}
      <div
        onClick={() => !isColour && fileRef.current?.click()}
        style={{
          width: 44, height: 44, borderRadius: 6, flexShrink: 0,
          overflow: 'hidden', cursor: isColour ? 'default' : 'pointer',
          background: colour ?? (thumb ? 'transparent' : '#1a1400'),
          border: '2px solid rgba(255,215,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: colour ? `0 0 10px ${colour}66` : undefined,
        }}
        title={isColour ? undefined : 'Click to upload image'}
      >
        {!colour && thumb && <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        {!colour && !thumb && <span style={{ fontSize: 18 }}>🌸</span>}
      </div>

      {!isColour && (
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      )}

      {/* Name */}
      {editingName ? (
        <input
          autoFocus value={nameVal}
          onChange={e => setNameVal(e.target.value)}
          onBlur={saveName}
          onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
          style={{
            flex: 1, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.4)',
            borderRadius: 4, padding: '4px 8px', color: GOLD,
            fontFamily: 'Oswald', fontSize: 14, outline: 'none',
          }}
        />
      ) : (
        <span
          onClick={() => setEditingName(true)}
          style={{
            flex: 1, fontFamily: 'Oswald', fontSize: 14, color: '#ddd',
            cursor: 'text', padding: '4px 6px', borderRadius: 4,
            border: '1px solid transparent',
          }}
          title="Click to rename"
        >
          {item.name}
        </span>
      )}

      {/* Image controls: upload + URL */}
      {!isColour && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.35)',
              borderRadius: 4, padding: '3px 9px', color: GOLD,
              fontFamily: 'Oswald', fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}
          >
            📁 Upload
          </button>
          <input
            value={imgInput} onChange={e => setImgInput(e.target.value)}
            placeholder="or paste URL…"
            style={{
              width: 110, background: 'rgba(255,215,0,0.04)', border: '1px solid #333',
              borderRadius: 4, padding: '3px 6px', color: '#aaa',
              fontFamily: 'Oswald', fontSize: 12, outline: 'none',
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleUrlSave(); }}
          />
          <button
            onClick={handleUrlSave}
            style={{
              background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 4, padding: '3px 8px', color: GOLD,
              fontFamily: 'Oswald', fontSize: 11, cursor: 'pointer',
            }}
          >Set</button>
        </div>
      )}

      {/* Delete */}
      {delConfirm ? (
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onDelete} style={{ background: '#CC0000', border: 'none', borderRadius: 4, padding: '3px 8px', color: '#fff', fontFamily: 'Oswald', fontSize: 11, cursor: 'pointer' }}>Yes</button>
          <button onClick={() => setDelConfirm(false)} style={{ background: '#333', border: '1px solid #555', borderRadius: 4, padding: '3px 8px', color: '#aaa', fontFamily: 'Oswald', fontSize: 11, cursor: 'pointer' }}>No</button>
        </div>
      ) : (
        <button
          onClick={() => setDelConfirm(true)}
          style={{ background: 'none', border: '1px solid #444', borderRadius: 4, padding: '3px 8px', color: '#666', fontFamily: 'Oswald', fontSize: 11, cursor: 'pointer' }}
        >✕</button>
      )}
    </div>
  );
}

interface ReelSectionProps {
  reel: Reel;
  onUpdate: (updated: Reel) => void;
  onDelete: () => void;
}

function ReelSection({ reel, onUpdate, onDelete }: ReelSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: reel.id });
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(reel.name);
  const [delConfirm, setDelConfirm] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const saveName = () => {
    if (nameVal.trim()) onUpdate({ ...reel, name: nameVal.trim() });
    setEditingName(false);
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const item: Item = { id: uid(), name: newItemName.trim(), image: '' };
    onUpdate({ ...reel, items: [...reel.items, item] });
    setNewItemName('');
  };

  const updateItem = (idx: number, updated: Item) => {
    const items = [...reel.items];
    items[idx] = updated;
    onUpdate({ ...reel, items });
  };

  const deleteItem = (idx: number) => {
    const items = reel.items.filter((_, i) => i !== idx);
    onUpdate({ ...reel, items });
  };

  return (
    <div ref={setNodeRef} style={{ ...style, marginBottom: 10 }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1600, #121000)',
        border: `2px solid ${open ? 'rgba(255,215,0,0.5)' : 'rgba(255,215,0,0.2)'}`,
        borderRadius: open ? '10px 10px 0 0' : 10,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
          {/* Drag handle */}
          <span
            {...attributes} {...listeners}
            style={{ cursor: 'grab', color: '#555', fontSize: 18, userSelect: 'none', lineHeight: 1 }}
            title="Drag to reorder"
          >⠿</span>

          {/* Name */}
          {editingName ? (
            <input
              autoFocus value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              style={{
                flex: 1, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.4)',
                borderRadius: 4, padding: '4px 8px', color: GOLD,
                fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 2, outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setEditingName(true)}
              style={{ flex: 1, fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 2, color: GOLD, cursor: 'text' }}
              title="Click to rename"
            >
              {reel.name}
            </span>
          )}

          <span style={{ fontFamily: 'Oswald', fontSize: 11, color: '#555' }}>{reel.items.length} items</span>

          {/* Delete */}
          {delConfirm ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={onDelete} style={{ background: '#CC0000', border: 'none', borderRadius: 4, padding: '3px 8px', color: '#fff', fontFamily: 'Oswald', fontSize: 11, cursor: 'pointer' }}>Delete</button>
              <button onClick={() => setDelConfirm(false)} style={{ background: '#333', border: '1px solid #555', borderRadius: 4, padding: '3px 8px', color: '#aaa', fontFamily: 'Oswald', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setDelConfirm(true)}
              style={{ background: 'none', border: '1px solid #444', borderRadius: 4, padding: '3px 8px', color: '#666', fontFamily: 'Oswald', fontSize: 11, cursor: 'pointer' }}
            >Delete Reel</button>
          )}

          {/* Toggle */}
          <button
            onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: '1px solid #333', borderRadius: 4, padding: '3px 10px', color: '#888', fontFamily: 'Oswald', fontSize: 13, cursor: 'pointer', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}
          >▼</button>
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '0 14px 14px',
                borderTop: '1px solid rgba(255,215,0,0.1)',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {reel.items.length === 0 && (
                  <p style={{ fontFamily: 'Oswald', color: '#555', fontSize: 13, padding: '8px 0' }}>No items yet.</p>
                )}
                {reel.items.map((item, idx) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    isColour={reel.isColour}
                    onDelete={() => deleteItem(idx)}
                    onUpdate={updated => updateItem(idx, updated)}
                  />
                ))}

                {/* Add item */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addItem(); }}
                    placeholder="New item name…"
                    style={{
                      flex: 1, background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.3)',
                      borderRadius: 6, padding: '7px 10px', color: '#ddd',
                      fontFamily: 'Oswald', fontSize: 14, outline: 'none',
                    }}
                  />
                  <button
                    onClick={addItem}
                    style={{
                      background: 'linear-gradient(135deg, #8B6914, #B8860B)',
                      border: '1px solid #FFD700', borderRadius: 6,
                      padding: '7px 16px', color: GOLD,
                      fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 1,
                      cursor: 'pointer',
                    }}
                  >+ Add</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface Props {
  reels: Reel[];
  setReels: (r: Reel[] | ((prev: Reel[]) => Reel[])) => void;
  machineName: string;
  setMachineName: (n: string) => void;
}

export default function EditMode({ reels, setReels, machineName, setMachineName }: Props) {
  const [newReelName, setNewReelName] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addReel = () => {
    if (!newReelName.trim()) return;
    const reel: Reel = { id: uid(), name: newReelName.trim(), items: [] };
    setReels(prev => [...prev, reel]);
    setNewReelName('');
  };

  const updateReel = (updated: Reel) => {
    setReels(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const deleteReel = (id: string) => {
    setReels(prev => prev.filter(r => r.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setReels(prev => {
        const oldIdx = prev.findIndex(r => r.id === active.id);
        const newIdx = prev.findIndex(r => r.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh', padding: '90px 16px 60px',
      maxWidth: 800, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 30, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'Bebas Neue', fontSize: 42, letterSpacing: 6,
          background: 'linear-gradient(180deg, #FFE57A, #FFD700 40%, #B8860B)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))',
          marginBottom: 6,
        }}>
          ⚙ Configuration Panel
        </h1>
        <p style={{ fontFamily: 'Oswald', color: '#666', fontSize: 14, letterSpacing: 1 }}>
          Manage reels and items. Drag to reorder.
        </p>
      </div>

      <StorageBar />

      {/* Machine name */}
      <div style={{
        marginBottom: 24, padding: '14px 18px',
        background: 'linear-gradient(135deg, #1a1600, #121000)',
        border: '2px solid rgba(255,215,0,0.3)',
        borderRadius: 10,
      }}>
        <label style={{
          display: 'block', fontFamily: 'Oswald', fontSize: 11,
          color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
        }}>
          Machine Name
        </label>
        <input
          value={machineName}
          onChange={e => setMachineName(e.target.value)}
          maxLength={30}
          placeholder="LUCKY BLOOM"
          style={{
            width: '100%', background: 'rgba(255,215,0,0.06)',
            border: '1px solid rgba(255,215,0,0.4)', borderRadius: 6,
            padding: '9px 12px', color: GOLD,
            fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 3,
            outline: 'none',
          }}
        />
      </div>

      {/* Reels list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={reels.map(r => r.id)} strategy={verticalListSortingStrategy}>
          {reels.map(reel => (
            <ReelSection
              key={reel.id}
              reel={reel}
              onUpdate={updateReel}
              onDelete={() => deleteReel(reel.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {reels.length === 0 && (
        <div style={{
          fontFamily: 'Oswald', color: '#555', textAlign: 'center',
          padding: '40px 20px', border: '1px dashed #333', borderRadius: 10,
          marginBottom: 20,
        }}>
          No reels yet. Add your first category below.
        </div>
      )}

      {/* Add reel */}
      <div style={{
        marginTop: 20, padding: '16px 20px',
        background: 'linear-gradient(135deg, #1a1600, #121000)',
        border: '2px dashed rgba(255,215,0,0.3)',
        borderRadius: 10,
        display: 'flex', gap: 10,
      }}>
        <input
          value={newReelName}
          onChange={e => setNewReelName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addReel(); }}
          placeholder="New category name…"
          style={{
            flex: 1, background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: 6, padding: '8px 12px', color: '#ddd',
            fontFamily: 'Oswald', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={addReel}
          style={{
            background: 'linear-gradient(135deg, #8B6914, #B8860B, #FFD700)',
            border: '2px solid #FFD700', borderRadius: 6,
            padding: '8px 20px', color: '#000',
            fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1,
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(255,215,0,0.3)',
          }}
        >+ Add Reel</button>
      </div>
    </div>
  );
}
