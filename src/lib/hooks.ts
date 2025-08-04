import { useState, useEffect } from 'react';

// Hook for responsive behavior
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile, isTablet, isDesktop };
}

// Hook for touch device detection
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
  }, []);

  return isTouch;
}

// Hook for performance optimization on mobile
export function usePerformanceMode() {
  const { isMobile } = useResponsive();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches || isMobile);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches || isMobile);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isMobile]);

  return {
    reducedMotion,
    shouldOptimize: isMobile,
    animationDuration: reducedMotion ? 0 : isMobile ? 200 : 300,
  };
}
