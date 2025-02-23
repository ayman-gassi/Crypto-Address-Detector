
import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
  width: number;
  height: number;
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    userAgent: '',
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    
    const checkDevice = () => {
      const isMobile = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent) || width <= 768;
      const isTablet = /ipad|tablet|playbook|silk/i.test(userAgent) || (width > 768 && width <= 1024);
      const isDesktop = !isMobile && !isTablet;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        userAgent,
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // התאמת גודל הפונט הבסיסי לרוחב המסך
      if (isMobile) {
        document.documentElement.style.fontSize = '14px';
      } else if (isTablet) {
        document.documentElement.style.fontSize = '16px';
      } else {
        document.documentElement.style.fontSize = '18px';
      }
    };

    checkDevice();

    const handleResize = () => {
      checkDevice();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
}
