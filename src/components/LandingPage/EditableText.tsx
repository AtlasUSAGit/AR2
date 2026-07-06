import React, { useState, useEffect, useRef } from 'react';
import { useLandingPage } from './LandingPageContext';

interface EditableTextProps {
  section: 'hero' | 'about' | 'achievements' | 'work' | 'testimonials';
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
  const { data, isEditMode, updateData, updateArrayData } = useLandingPage();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Get current value from context
  let currentValue = '';
  if (arrayField && index !== undefined) {
    const arr = (data[section] as any)[arrayField];
    if (arr && arr[index]) {
      currentValue = arr[index][field];
    }
  } else {
    currentValue = (data[section] as any)[field];
  }

  // Use children if no value found (fallback)
  const displayValue = currentValue !== undefined ? currentValue : children;

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
        updateArrayData(section, arrayField, index, field, newValue);
      } else {
        updateData(section, field, newValue);
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
      // Use textarea for longer text, input for shorter
      const isLongText = typeof displayValue === 'string' && displayValue.length > 50;
      
      if (isLongText) {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            defaultValue={displayValue as string}
            onBlur={handleBlur}
            className={`${className} bg-zinc-900 text-white border border-purple-500 rounded p-2 min-w-full focus:outline-none focus:ring-2 focus:ring-purple-500 w-full resize-y`}
            rows={3}
            style={{ display: 'block', zIndex: 1000, position: 'relative' }}
          />
        );
      }
      
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          defaultValue={displayValue as string}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${className} bg-zinc-900 text-white border border-purple-500 rounded px-2 py-1 min-w-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500`}
          style={{ display: 'inline-block', zIndex: 1000, position: 'relative' }}
        />
      );
    }

    return (
      <Component 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`${className} hover:outline hover:outline-2 hover:outline-dashed hover:outline-purple-500 cursor-text transition-all duration-200 relative group`}
        title="Click to edit"
      >
        {displayValue}
        <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-[10px] px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50">
          Edit
        </div>
      </Component>
    );
  }

  return <Component className={className}>{displayValue}</Component>;
};

export default EditableText;
