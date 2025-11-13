import { useEffect } from 'react';

export const useStoreRefresh = () => {
  const refreshStore = () => {
    if (typeof window !== 'undefined' && window.refreshStoreData) {
      window.refreshStoreData();
    }
  };

  return { refreshStore };
};