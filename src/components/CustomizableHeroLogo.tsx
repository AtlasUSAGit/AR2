import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import { useAppContext } from '../AppContext';
import { RefreshCw } from 'lucide-react';

export default function CustomizableHeroLogo() {
  const { currentUser } = useAppContext();
  const isSysAdmin = currentUser?.role === 'SysAdmin';

  const [scale, setScale] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: posX, y: posY });

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem('ukbfc_hero_logo_transform');
    if (saved) {
      try {
        const { s, x, y } = JSON.parse(saved);
        if (s !== undefined) setScale(s);
        if (x !== undefined) setPosX(x);
        if (y !== undefined) setPosY(y);
        currentPos.current = { x: x || 0, y: y || 0 };
      } catch (e) {
        console.error('Failed to parse hero logo transform', e);
      }
    }
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem('ukbfc_hero_logo_transform', JSON.stringify({ s: scale, x: posX, y: posY }));
    currentPos.current = { x: posX, y: posY };
  }, [scale, posX, posY]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isSysAdmin) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - currentPos.current.x,
      y: e.clientY - currentPos.current.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isSysAdmin) return;
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    setPosX(newX);
    setPosY(newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isSysAdmin) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const resetTransform = () => {
    setScale(1);
    setPosX(0);
    setPosY(0);
  };

  return (
    <div className="relative inline-block mb-8 group">
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative ${isSysAdmin ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
      >
        <Logo 
          size={450} 
          glow={true} 
          padding={8} 
          objectFit="cover" 
          className="hover:scale-110 duration-500"
          imageStyle={{ 
            transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
            transformOrigin: 'center center',
            willChange: 'transform'
          }} 
        />
      </div>

      {isSysAdmin && (
        <div className="absolute top-0 right-[-140px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/80 border border-zinc-800 rounded-lg p-3 w-32 shadow-xl backdrop-blur-sm z-50">
          <div className="text-[10px] font-mono text-zinc-400 mb-2 font-bold uppercase tracking-wider text-center">
            Logo Admin
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Zoom</label>
              <input 
                type="range" 
                min="0.5" 
                max="2.5" 
                step="0.05" 
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-[#A493F7]"
              />
            </div>
            <div className="text-center">
              <button 
                onClick={resetTransform}
                className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700 flex items-center justify-center gap-1 w-full transition-colors"
              >
                <RefreshCw size={10} /> Reset
              </button>
            </div>
            <div className="text-[9px] text-zinc-500 text-center italic mt-1 leading-tight">
              Drag logo to pan
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
