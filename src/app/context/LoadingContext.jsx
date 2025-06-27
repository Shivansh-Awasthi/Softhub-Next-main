'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import CategorySkeleton from '@/app/category/CategorySkeleton';
import HomeSkeleton from '@/app/components/HomeSkeleton';

// Create the context
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => { },
  showSkeleton: () => { },
  hideSkeleton: () => { },
});

// Custom hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

// Provider component
export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('Generic');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine platform based on URL
  useEffect(() => {
    if (pathname.includes('/mac')) {
      setPlatform('Mac');
    } else if (pathname.includes('/pc')) {
      setPlatform('PC');
    } else if (pathname.includes('/android')) {
      setPlatform('Android');
    } else if (pathname.includes('/ps') || pathname.includes('/playstation') || pathname.includes('/ppsspp')) {
      setPlatform('PlayStation');
    } else {
      setPlatform('Generic');
    }
  }, [pathname]);

  // Show loading state when route changes
  useEffect(() => {
    if (pathname.includes('/category/') || pathname === '/') {
      setIsLoading(true);

      // Hide skeleton after a short delay to simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); // Adjust timing as needed

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Helper functions
  const showSkeleton = (platformType = null) => {
    if (platformType) setPlatform(platformType);
    setIsLoading(true);
  };

  const hideSkeleton = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, showSkeleton, hideSkeleton }}>
      {isLoading ? (
        pathname === '/' ? (
          <HomeSkeleton />
        ) : pathname.includes('/category/') ? (
          <CategorySkeleton itemCount={16} platform={platform} />
        ) : (
          children
        )
      ) : (
        children
      )}
    </LoadingContext.Provider>
  );
}

export default LoadingContext;
