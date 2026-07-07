import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LandingPageVersion, defaultLandingPageData } from './landingPageSchema';

interface LandingPageContextType {
  data: LandingPageVersion['content'];
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  updateData: (section: keyof LandingPageVersion['content'], field: string, value: any) => void;
  saveVersion: (name: string) => void;
  loadVersion: (id: string) => void;
  versions: LandingPageVersion[];
  deleteVersion: (id: string) => void;
  updateArrayData: (section: keyof LandingPageVersion['content'], arrayField: string, index: number, field: string, value: any, nestedIndices?: number[]) => void;
  updateStringArrayData: (section: keyof LandingPageVersion['content'], arrayField: string, index: number, value: string) => void;
  updateStyleData: (key: string, style: React.CSSProperties) => void;
}

const LandingPageContext = createContext<LandingPageContextType | undefined>(undefined);

export const LandingPageProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<LandingPageVersion['content']>(defaultLandingPageData);
  const [isEditMode, setEditMode] = useState(false);
  const [versions, setVersions] = useState<LandingPageVersion[]>([]);

  // Load versions from localStorage on mount
  useEffect(() => {
    const storedVersions = localStorage.getItem('landingPageVersions');
    if (storedVersions) {
      const parsedVersions = JSON.parse(storedVersions) as LandingPageVersion[];
      setVersions(parsedVersions);
      const activeVersion = parsedVersions.find(v => v.isActive);
      if (activeVersion) {
        setData(activeVersion.content);
      }
    } else {
      // Create initial version
      const initialVersion: LandingPageVersion = {
        id: Date.now().toString(),
        name: 'Initial Version',
        timestamp: Date.now(),
        isActive: true,
        content: defaultLandingPageData
      };
      setVersions([initialVersion]);
      localStorage.setItem('landingPageVersions', JSON.stringify([initialVersion]));
    }
  }, []);

  const saveVersion = (name: string) => {
    const newVersion: LandingPageVersion = {
      id: Date.now().toString(),
      name,
      timestamp: Date.now(),
      isActive: true,
      content: data
    };

    const newVersions = versions.map(v => ({ ...v, isActive: false })).concat(newVersion);
    setVersions(newVersions);
    localStorage.setItem('landingPageVersions', JSON.stringify(newVersions));
  };

  const loadVersion = (id: string) => {
    const versionToLoad = versions.find(v => v.id === id);
    if (versionToLoad) {
      setData(versionToLoad.content);
      const newVersions = versions.map(v => ({
        ...v,
        isActive: v.id === id
      }));
      setVersions(newVersions);
      localStorage.setItem('landingPageVersions', JSON.stringify(newVersions));
    }
  };

  const deleteVersion = (id: string) => {
    const newVersions = versions.filter(v => v.id !== id);
    if (newVersions.length === 0) {
      // Recreate default if all deleted
      const initialVersion: LandingPageVersion = {
        id: Date.now().toString(),
        name: 'Default',
        timestamp: Date.now(),
        isActive: true,
        content: defaultLandingPageData
      };
      newVersions.push(initialVersion);
      setData(initialVersion.content);
    } else {
      // If active was deleted, make the last one active
      if (!newVersions.find(v => v.isActive)) {
        newVersions[newVersions.length - 1].isActive = true;
        setData(newVersions[newVersions.length - 1].content);
      }
    }
    setVersions(newVersions);
    localStorage.setItem('landingPageVersions', JSON.stringify(newVersions));
  };

  const updateData = (section: keyof LandingPageVersion['content'], field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateArrayData = (section: keyof LandingPageVersion['content'], arrayField: string, index: number, field: string, value: any, nestedIndices?: number[]) => {
    setData(prev => {
      const sectionData = prev[section] as any;
      const arrayData = [...sectionData[arrayField]];
      
      if (nestedIndices && nestedIndices.length > 0) {
        // Deep clone the object at index to avoid mutating state
        const item = JSON.parse(JSON.stringify(arrayData[index]));
        let current = item[field];
        // Navigate to the deeply nested array, e.g. nestedIndices = [0, 1]
        for (let i = 0; i < nestedIndices.length - 1; i++) {
          current = current[nestedIndices[i]];
        }
        current[nestedIndices[nestedIndices.length - 1]] = value;
        arrayData[index] = item;
      } else {
        arrayData[index] = { ...arrayData[index], [field]: value };
      }
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [arrayField]: arrayData
        }
      };
    });
  };

  const updateStringArrayData = (section: keyof LandingPageVersion['content'], arrayField: string, index: number, value: string) => {
    setData(prev => {
      const sectionData = prev[section] as any;
      const arrayData = [...sectionData[arrayField]];
      arrayData[index] = value;
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [arrayField]: arrayData
        }
      };
    });
  };

  const updateStyleData = (key: string, style: React.CSSProperties) => {
    setData(prev => ({
      ...prev,
      styles: {
        ...(prev.styles || {}),
        [key]: {
          ...((prev.styles || {})[key] || {}),
          ...style
        }
      }
    }));
  };

  return (
    <LandingPageContext.Provider value={{ data, isEditMode, setEditMode, updateData, updateArrayData, updateStringArrayData, updateStyleData, saveVersion, loadVersion, versions, deleteVersion }}>
      {children}
    </LandingPageContext.Provider>
  );
};

export const useLandingPage = () => {
  const context = useContext(LandingPageContext);
  if (context === undefined) {
    throw new Error('useLandingPage must be used within a LandingPageProvider');
  }
  return context;
};
