import React from 'react';
import { useLandingPage } from './LandingPageContext';
import { Pencil } from 'lucide-react';

interface EditableImageProps {
  section: 'hero' | 'about' | 'achievements' | 'work' | 'testimonials';
  field?: string;
  arrayField?: string;
  index?: number;
  isStringArray?: boolean;
  onUpdateUrlOverride?: (newUrl: string) => void;
  children: React.ReactNode;
  className?: string;
}

const EditableImage: React.FC<EditableImageProps> = ({
  section,
  field,
  arrayField,
  index,
  isStringArray,
  onUpdateUrlOverride,
  children,
  className = ''
}) => {
  const { isEditMode, updateData, updateArrayData, updateStringArrayData } = useLandingPage();

  if (!isEditMode) return <div className={className}>{children}</div>;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newUrl = window.prompt('Enter new image/video URL:');
    if (newUrl && newUrl.trim() !== '') {
      if (onUpdateUrlOverride) {
        onUpdateUrlOverride(newUrl);
      } else if (isStringArray && arrayField && index !== undefined) {
        updateStringArrayData(section, arrayField, index, newUrl);
      } else if (arrayField && index !== undefined && field) {
        updateArrayData(section, arrayField, index, field, newUrl);
      } else if (field) {
        updateData(section, field, newUrl);
      }
    }
  };

  return (
    <div className={`relative group inline-block ${className}`}>
      <div className="group-hover:opacity-50 transition-opacity duration-300">
        {children}
      </div>
      <button
        onClick={handleEdit}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition shadow-[0_0_15px_rgba(164,147,247,0.5)] z-50 hover:bg-purple-500 hover:scale-110 flex items-center gap-2 text-xs font-bold"
        title="Edit Image URL"
      >
        <Pencil size={14} /> EDIT URL
      </button>
    </div>
  );
};

export default EditableImage;
