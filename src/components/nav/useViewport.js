import { useEffect, useState } from "react";
// Hook to determine if the viewport is desktop sized
const DESKTOP_QUERY = "(min-width: 1024px)"; // ajusta  breakpoint
// Custom hook to track viewport size
export default function useViewport() {
  
    // Initialize state based on current viewport 
  const [isDesktop, setIsDesktop] = useState(
    
    typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
  );
// Set up event listener on mount to track viewport changes
  useEffect(() => {

  const mq = window.matchMedia(DESKTOP_QUERY);
 const onChange = e => setIsDesktop(e.matches);
 
    mq.addEventListener?.("change", onChange);
    mq.addListener?.(onChange);

    return () => {
      mq.removeEventListener?.("change", onChange);
      mq.removeListener?.(onChange);

    };

  }, []);

  return { isDesktop };
}

