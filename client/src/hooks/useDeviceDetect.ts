import { useState, useEffect } from 'react';
import { DeviceType } from '../types/survey';

const MOBILE_BREAKPOINT = 768;

export function useDeviceDetect(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(() =>
    window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop'
  );

  useEffect(() => {
    const checkDevice = () => {
      setDeviceType(window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop');
    };

    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
}
