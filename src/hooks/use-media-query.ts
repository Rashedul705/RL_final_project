
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is defined (i.e., we are on the client side)
    if (typeof window === 'undefined') {
      return;
    }

    const matchMedia = window.matchMedia(query);

    // Set the initial value
    setValue(matchMedia.matches);

    const handleChange = () => {
      setValue(matchMedia.matches);
    };

    // Add listener for changes
    matchMedia.addEventListener('change', handleChange);

    // Cleanup listener on component unmount
    return () => {
      matchMedia.removeEventListener('change', handleChange);
    };
  }, [query]);

  return value;
}
