
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: FontSize;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
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


export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on initial client-side mount
    const savedContrast = localStorage.getItem(LOCAL_STORAGE_KEY_CONTRAST);
    const savedFontSize = localStorage.getItem(LOCAL_STORAGE_KEY_FONT_SIZE) as FontSize | null;

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

    setIsMounted(true);
  }, []);

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

  // Avoid rendering children until settings have been loaded on the client
  if (!isMounted) {
    return null;
  }

  return (
    <AccessibilityContext.Provider
      value={{ isHighContrast, toggleHighContrast, fontSize, increaseFontSize, decreaseFontSize }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
