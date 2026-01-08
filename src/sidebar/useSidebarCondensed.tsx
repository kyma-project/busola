import { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { isSidebarCondensedAtom } from 'state/settings/isSidebarCondensedAtom';

function getWindowDimensions() {
  const { innerWidth: width } = window;
  return width;
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export default function useSidebarCondensed() {
  const width = useWindowDimensions();
  const setSidebarCondensed = useSetAtom(isSidebarCondensedAtom);

  useEffect(() => {
    if (width <= 900) setSidebarCondensed(true);
    else setSidebarCondensed(false);
  }, [width, setSidebarCondensed]);
}
