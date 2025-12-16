
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';
type ToolbarSide = 'left' | 'right';

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: FontSize;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toolbarPosition: { top: number; side: ToolbarSide };
  setToolbarPosition: React.Dispatch<React.SetStateAction<{ top: number; side: ToolbarSide }>>;
  toggleToolbarSide: () => void;
  showLabels: boolean;
  toggleShowLabels: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl'];
const FONT_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};
const LOCAL_STORAGE_KEY_CONTRAST = 'accessibility-high-contrast';
const LOCAL_STORAGE_KEY_FONT_SIZE = 'accessibility-font-size';
const LOCAL_STORAGE_KEY_TOOLBAR_POS = 'accessibility-toolbar-position';
const LOCAL_STORAGE_KEY_SHOW_LABELS = 'accessibility-show-labels';


export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number, side: ToolbarSide }>({ top: 16, side: 'right' });
  const [showLabels, setShowLabels] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on initial client-side mount
    const savedContrast = localStorage.getItem(LOCAL_STORAGE_KEY_CONTRAST);
    const savedFontSize = localStorage.getItem(LOCAL_STORAGE_KEY_FONT_SIZE) as FontSize | null;
    const savedToolbarPos = localStorage.getItem(LOCAL_STORAGE_KEY_TOOLBAR_POS);
    const savedShowLabels = localStorage.getItem(LOCAL_STORAGE_KEY_SHOW_LABELS);


    if (savedContrast) {
      const newContrastState = savedContrast === 'true';
      setIsHighContrast(newContrastState);
      document.documentElement.classList.toggle('high-contrast', newContrastState);
    }
    if (savedFontSize && FONT_SIZES.includes(savedFontSize)) {
      const newFontSize = savedFontSize;
      setFontSize(newFontSize);
      // Remove old size classes and add the new one
      document.documentElement.classList.remove(...Object.values(FONT_SIZE_CLASSES));
      document.documentElement.classList.add(FONT_SIZE_CLASSES[newFontSize]);
    }
    
    if (savedToolbarPos) {
        try {
            const pos = JSON.parse(savedToolbarPos);
            if (pos.top && (pos.side === 'left' || pos.side === 'right')) {
                setToolbarPosition(pos);
            }
        } catch (e) {
            console.error("Failed to parse toolbar position from localStorage", e);
        }
    }

    if (savedShowLabels) {
        setShowLabels(savedShowLabels === 'true');
    }

    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if(isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEY_TOOLBAR_POS, JSON.stringify(toolbarPosition));
    }
  }, [toolbarPosition, isMounted]);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => {
      const newState = !prev;
      localStorage.setItem(LOCAL_STORAGE_KEY_CONTRAST, String(newState));
      document.documentElement.classList.toggle('high-contrast', newState);
      return newState;
    });
  }, []);

  const changeFontSize = (direction: 'increase' | 'decrease') => {
    setFontSize(currentSize => {
      const currentIndex = FONT_SIZES.indexOf(currentSize);
      let newIndex = currentIndex;

      if (direction === 'increase') {
        newIndex = Math.min(FONT_SIZES.length - 1, currentIndex + 1);
      } else {
        newIndex = Math.max(0, currentIndex - 1);
      }

      const newSize = FONT_SIZES[newIndex];
      localStorage.setItem(LOCAL_STORAGE_KEY_FONT_SIZE, newSize);

      // Update class on the root element
      document.documentElement.classList.remove(...Object.values(FONT_SIZE_CLASSES));
      document.documentElement.classList.add(FONT_SIZE_CLASSES[newSize]);

      return newSize;
    });
  };

  const increaseFontSize = useCallback(() => changeFontSize('increase'), []);
  const decreaseFontSize = useCallback(() => changeFontSize('decrease'), []);

  const toggleToolbarSide = useCallback(() => {
    setToolbarPosition(prev => ({
        ...prev,
        side: prev.side === 'left' ? 'right' : 'left',
    }));
  }, []);

  const toggleShowLabels = useCallback(() => {
    setShowLabels(prev => {
        const newState = !prev;
        localStorage.setItem(LOCAL_STORAGE_KEY_SHOW_LABELS, String(newState));
        return newState;
    });
  }, []);


  // Avoid rendering children until settings have been loaded on the client
  if (!isMounted) {
    return null;
  }

  return (
    <AccessibilityContext.Provider
      value={{ isHighContrast, toggleHighContrast, fontSize, increaseFontSize, decreaseFontSize, toolbarPosition, setToolbarPosition, toggleToolbarSide, showLabels, toggleShowLabels }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
