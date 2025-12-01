// src/hooks/useInfiniteScrollVirtualized.ts
import { useState, useRef, useEffect } from "react";

export function useInfiniteScrollVirtualized(totalCount: number, chunkSize = 20) {
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + chunkSize, totalCount));
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [totalCount]);

  return { visibleCount, loaderRef };
}
