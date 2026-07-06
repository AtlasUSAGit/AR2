import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLandingPage } from './LandingPageContext';

interface EditableTextProps {
  section: string;
  field: string;
  arrayField?: string;
  index?: number;
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
}

const EditableText: React.FC<EditableTextProps> = ({ 
  section, 
  field, 
  arrayField,
  index,
  as: Component = 'span', 
  className = '', 
  children 
}) => {
  const { data, isEditMode, updateData, updateArrayData, updateStyleData } = useLandingPage();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [toolbarRect, setToolbarRect] = useState<DOMRect | null>(null);

  // Get current value from context
  let currentValue = '';
  if (arrayField && index !== undefined) {
    const arr = (data[section as keyof typeof data] as any)[arrayField];
    if (arr && arr[index]) {
      currentValue = arr[index][field];
    }
  } else {
    currentValue = (data[section as keyof typeof data] as any)?.[field];
  }

  const displayValue = currentValue !== undefined ? currentValue : children;
  
  const styleKey = arrayField && index !== undefined ? `${section}_${arrayField}_${index}_${field}` : `${section}_${field}`;
  const customStyle = data.styles?.[styleKey] || {};

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
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [isEditing]);

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsEditing(false);
    const newValue = e.target.value;
    
    if (newValue !== currentValue) {
      if (arrayField && index !== undefined) {
        updateArrayData(section as keyof typeof data, arrayField, index, field, newValue);
      } else {
        updateData(section as keyof typeof data, field, newValue);
      }
    }
  };

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
      inputRef.current?.blur();
    }
  };

  if (isEditMode) {
    if (isEditing) {
      const toolbar = toolbarRect ? createPortal(
        <div 
          style={{
            position: 'fixed',
            top: toolbarRect.top - 45,
            left: toolbarRect.left,
            zIndex: 99999
          }}
          className="bg-zinc-900 border border-zinc-700 p-1 flex gap-2 rounded shadow-2xl"
          onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking toolbar
        >
          <select 
            value={customStyle.fontFamily || ''} 
            onChange={e => updateStyleData(styleKey, { fontFamily: e.target.value })}
            className="bg-black text-xs text-white border border-zinc-700 rounded p-1"
          >
            <option value="">Default Font</option>
            <option value="Inter, sans-serif">Inter</option>
            <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
            <option value="'Fahkwang', sans-serif">Fahkwang</option>
            <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
          </select>
          <input 
            type="text" 
            placeholder="Size (e.g. 2rem)" 
            value={customStyle.fontSize || ''} 
            onChange={e => updateStyleData(styleKey, { fontSize: e.target.value })}
            className="bg-black text-xs text-white border border-zinc-700 rounded p-1 w-24"
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
            onBlur={handleBlur}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={`${className} bg-zinc-900 text-white border border-purple-500 rounded p-2 min-w-[100px] w-full focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-pre-wrap overflow-hidden resize-none`}
            style={{ ...customStyle, display: 'block', zIndex: 1000, position: 'relative' }}
            rows={1}
          />
        </div>
      );
    }

    return (
      <Component 
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`${className} hover:outline hover:outline-2 hover:outline-dashed hover:outline-purple-500 cursor-text transition-all duration-200 relative group whitespace-pre-wrap`}
        style={customStyle}
        title="Click to edit"
      >
        {displayValue}
        <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-[10px] px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50">
          Edit
        </div>
      </Component>
    );
  }

  return <Component className={`${className} whitespace-pre-wrap`} style={customStyle}>{displayValue}</Component>;
};

export default EditableText;
