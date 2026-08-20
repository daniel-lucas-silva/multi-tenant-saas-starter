import * as React from 'react';

export type Device = 'mobile' | 'tablet' | 'desktop';

function compute(width: number): Device {
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

/** Live viewport classification: mobile <=768, tablet 769-1024, desktop >=1025 */
export function useBreakpoint() {
  const [width, setWidth] = React.useState<number>(typeof window === 'undefined' ? 1440 : window.innerWidth);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const device = compute(width);
  return {
    width,
    device,
    mounted,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
  };
}
