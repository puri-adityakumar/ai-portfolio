'use client';

import { useState, useEffect } from 'react';

export default function ResponsiveTest() {
  const [screenSize, setScreenSize] = useState<string>('');
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      
      if (width < 640) {
        setScreenSize('Mobile (< 640px)');
      } else if (width < 768) {
        setScreenSize('Small Tablet (640px - 768px)');
      } else if (width < 1024) {
        setScreenSize('Tablet (768px - 1024px)');
      } else if (width < 1280) {
        setScreenSize('Desktop (1024px - 1280px)');
      } else {
        setScreenSize('Large Desktop (> 1280px)');
      }
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white text-xs px-3 py-2 rounded-lg font-mono">
      <div>{screenSize}</div>
      <div>{dimensions.width} × {dimensions.height}</div>
    </div>
  );
}