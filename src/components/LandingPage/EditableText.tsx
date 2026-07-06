import React, { useState, useEffect, useRef } from 'react';
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
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

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
    }
  }, [isEditing]);

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  if (isEditMode) {
    if (isEditing) {
      const isLongText = typeof displayValue === 'string' && displayValue.length > 50;
      
      const inputElement = isLongText ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          defaultValue={displayValue as string}
          onBlur={handleBlur}
          className={`${className} bg-zinc-900 text-white border border-purple-500 rounded p-2 min-w-full focus:outline-none focus:ring-2 focus:ring-purple-500 w-full resize-y whitespace-pre-wrap`}
          rows={3}
          style={{ ...customStyle, display: 'block', zIndex: 1000, position: 'relative' }}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          defaultValue={displayValue as string}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${className} bg-zinc-900 text-white border border-purple-500 rounded px-2 py-1 min-w-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-pre-wrap`}
          style={{ ...customStyle, display: 'inline-block', zIndex: 1000, position: 'relative' }}
        />
      );

      return (
        <div className="relative inline-block w-full">
          <div 
            className="absolute -top-10 left-0 bg-zinc-900 border border-zinc-700 p-1 flex gap-2 rounded shadow-xl z-[1001]"
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
          </div>
          {inputElement}
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
