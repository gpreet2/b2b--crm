// Simple responsive hook for components
export const useResponsive = () => {
  return {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: "desktop" as const
  };
};
