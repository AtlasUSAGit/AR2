import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLandingPage } from './LandingPageContext';

interface EditableTextProps {
  section: string;
  field: string;
  arrayField?: string;
  index?: number;
  nestedIndices?: number[];
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  renderBefore?: React.ReactNode;
}

const EditableText: React.FC<EditableTextProps> = ({ 
  section, 
  field, 
  arrayField,
  index,
  nestedIndices,
  as: Component = 'span', 
  className = '', 
  children,
  renderBefore
}) => {
  const { data, isEditMode, updateData, updateArrayData, updateStyleData } = useLandingPage();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarRect, setToolbarRect] = useState<DOMRect | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const currentTransform = useRef({ x: 0, y: 0 });

  // Get current value from context
  let currentValue = '';
  if (arrayField && index !== undefined) {
    const arr = (data[section as keyof typeof data] as any)[arrayField];
    if (arr && arr[index]) {
      let val = arr[index][field];
      if (nestedIndices && nestedIndices.length > 0 && val) {
        for (const idx of nestedIndices) {
          val = val[idx];
        }
      }
      currentValue = val;
    }
  } else {
    currentValue = (data[section as keyof typeof data] as any)?.[field];
  }

  const displayValue = currentValue !== undefined ? currentValue : children;
  
  const styleKey = arrayField && index !== undefined ? `${section}_${arrayField}_${index}_${field}${nestedIndices ? '_' + nestedIndices.join('_') : ''}` : `${section}_${field}`;
  const customStyle = data.styles?.[styleKey] || {};

  const saveChanges = () => {
    if (!inputRef.current) return;
    const newValue = inputRef.current.value;
    
    let styleUpdates: any = null;
    const newWidth = inputRef.current.style.width;
    const newHeight = inputRef.current.style.height;
    
    if (newWidth && newWidth !== customStyle.width && newWidth !== '100%') {
      styleUpdates = { ...styleUpdates, width: newWidth };
    }
    if (newHeight && newHeight !== customStyle.height && newHeight !== 'auto') {
      styleUpdates = { ...styleUpdates, height: newHeight };
    }

    if (styleUpdates) {
      updateStyleData(styleKey, styleUpdates);
    }

    if (newValue !== currentValue) {
      if (arrayField && index !== undefined) {
        updateArrayData(section as keyof typeof data, arrayField, index, field, newValue, nestedIndices);
      } else {
        updateData(section as keyof typeof data, field, newValue);
      }
    }
  };

  useEffect(() => {
    if (customStyle.transform) {
      const match = customStyle.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      if (match) {
        currentTransform.current = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
      }
    } else {
      currentTransform.current = { x: 0, y: 0 };
    }
  }, [customStyle.transform]);

  useEffect(() => {
    if (!isDragging) return;

    let localDx = 0;
    let localDy = 0;

    const handleMouseMove = (e: MouseEvent) => {
      localDx = e.clientX - dragStartPos.current.x;
      localDy = e.clientY - dragStartPos.current.y;
      setDragOffset({ x: localDx, y: localDy });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      const newX = currentTransform.current.x + localDx;
      const newY = currentTransform.current.y + localDy;
      updateStyleData(styleKey, { transform: `translate(${newX}px, ${newY}px)` });
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, styleKey]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      
      // Auto-resize initially
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';

      const updateRect = () => {
        if (inputRef.current) {
          setToolbarRect(inputRef.current.getBoundingClientRect());
        }
      };
      
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          inputRef.current && !inputRef.current.contains(target) &&
          toolbarRef.current && !toolbarRef.current.contains(target)
        ) {
          setIsEditing(false);
          saveChanges();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing, currentValue]); // Include currentValue so saveChanges captures the right closure

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    if (inputRef.current) {
      setToolbarRect(inputRef.current.getBoundingClientRect());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      saveChanges();
    }
  };

  if (isEditMode) {
    if (isEditing) {
      const toolbar = toolbarRect ? createPortal(
        <div 
          ref={toolbarRef}
          style={{
            position: 'fixed',
            top: toolbarRect.top - 45,
            left: toolbarRect.left,
            zIndex: 99999
          }}
          className="bg-zinc-900 border border-zinc-700 p-1 flex gap-2 rounded shadow-2xl"
        >
          <select 
            value={customStyle.fontFamily || ''} 
            onChange={e => updateStyleData(styleKey, { fontFamily: e.target.value })}
            className="bg-black text-xs text-white border border-zinc-700 rounded p-1"
          >
            <option value="">Default Font</option>
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="Inter, sans-serif">Inter</option>
            <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
            <option value="'Fahkwang', sans-serif">Fahkwang</option>
            <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
          </select>
          <input 
            type="text" 
            placeholder="Size (e.g. 24px, 2rem)" 
            value={customStyle.fontSize || ''} 
            onChange={e => {
              let val = e.target.value;
              // If user just types a number, assume pixels
              if (/^\d+$/.test(val)) {
                val += 'px';
              }
              updateStyleData(styleKey, { fontSize: val });
            }}
            className="bg-black text-xs text-white border border-zinc-700 rounded p-1 w-24"
          />
          <input 
            type="text" 
            placeholder="Link (https://...)" 
            value={customStyle.href || ''} 
            onChange={e => updateStyleData(styleKey, { href: e.target.value })}
            className="bg-black text-xs text-white border border-zinc-700 rounded p-1 w-32"
          />
        </div>,
        document.body
      ) : null;

      return (
        <div className="relative inline-block w-full">
          {toolbar}
          <textarea
            ref={inputRef}
            defaultValue={displayValue as string}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={`${className} bg-zinc-900 text-white border border-purple-500 rounded p-2 min-w-[100px] w-full focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-pre-wrap overflow-wrap-anywhere break-words resize`}
            style={{ ...customStyle, display: 'block', zIndex: 1000, position: 'relative', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            rows={1}
          />
        </div>
      );
    }

    const ComponentToRender = customStyle.href ? 'a' : Component;
    const extraProps = customStyle.href ? { href: customStyle.href, target: '_blank', rel: 'noopener noreferrer' } : {};

    const liveX = currentTransform.current.x + dragOffset.x;
    const liveY = currentTransform.current.y + dragOffset.y;
    const liveTransform = (liveX !== 0 || liveY !== 0) ? `translate(${liveX}px, ${liveY}px)` : customStyle.transform;

    // Force inline-block for spans/links so they can be transformed
    const computedDisplay = customStyle.display || ((ComponentToRender === 'span' || ComponentToRender === 'a') ? 'inline-block' : undefined);

    return (
      <ComponentToRender 
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        {...extraProps}
        className={`${className} hover:outline hover:outline-2 hover:outline-dashed hover:outline-purple-500 cursor-text transition-all duration-200 relative group whitespace-pre-wrap max-w-full break-words overflow-wrap-anywhere ${isDragging ? 'opacity-70' : ''}`}
        style={{ display: computedDisplay, minHeight: '1.5em', minWidth: '3em', maxWidth: '100vw', wordBreak: 'break-word', overflowWrap: 'anywhere', ...customStyle, transform: liveTransform }}
        title="Click to edit"
      >
        {renderBefore}
        {displayValue || <span className="opacity-40 italic">[Empty]</span>}
        <div className="absolute -top-6 right-0 flex gap-1 opacity-0 group-hover:opacity-100 z-[999999] transition-opacity">
          <div 
            className="bg-zinc-700 text-white text-[10px] px-2 py-1 rounded cursor-move pointer-events-auto hover:bg-zinc-600 shadow-lg"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
              dragStartPos.current = { x: e.clientX, y: e.clientY };
            }}
          >
            Move
          </div>
          <div className="bg-purple-600 text-white text-[10px] px-2 py-1 rounded pointer-events-none shadow-lg">
            Edit
          </div>
        </div>
      </ComponentToRender>
    );
  }

  const ComponentToRender = customStyle.href ? 'a' : Component;
  const extraProps = customStyle.href ? { href: customStyle.href, target: '_blank', rel: 'noopener noreferrer' } : {};
  const computedDisplay = customStyle.display || ((ComponentToRender === 'span' || ComponentToRender === 'a') ? 'inline-block' : undefined);

  return (
    <ComponentToRender {...extraProps} className={`${className} whitespace-pre-wrap max-w-full break-words overflow-wrap-anywhere`} style={{ display: computedDisplay, maxWidth: '100vw', wordBreak: 'break-word', overflowWrap: 'anywhere', ...customStyle }}>
      {renderBefore}
      {displayValue}
    </ComponentToRender>
  );
};

export default EditableText;
