/**
 * useAutoRefresh Hook
 */

import { useEffect, useRef, useState } from 'react';

export const useAutoRefresh = (key: string, interval: number) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refetchCallbackRef = useRef<(() => void) | null>(null);

  const setRefetchCallback = (callback: () => void) => {
    refetchCallbackRef.current = callback;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (refetchCallbackRef.current) {
        setIsRefreshing(true);
        refetchCallbackRef.current();
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return {
    isRefreshing,
    setRefetchCallback
  };
};
