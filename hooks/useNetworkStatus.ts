import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateOnlineStatus = () => {
        setIsConnected(navigator.onLine);
      };

      const updateConnectionSpeed = () => {
        // @ts-ignore - navigator.connection is experimental
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          const slowTypes = ['slow-2g', '2g', '3g'];
          setIsSlowConnection(slowTypes.includes(connection.effectiveType));
        }
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      // @ts-ignore
      if (navigator.connection) {
        // @ts-ignore
        navigator.connection.addEventListener('change', updateConnectionSpeed);
        updateConnectionSpeed();
      }

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
        // @ts-ignore
        if (navigator.connection) {
          // @ts-ignore
          navigator.connection.removeEventListener('change', updateConnectionSpeed);
        }
      };
    }
  }, []);

  return { isConnected, isSlowConnection };
}