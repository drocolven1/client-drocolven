// src/hooks/useProductoImagen.ts
import { useEffect, useState } from "react";

export function useProductoImagen(imgId?: string) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imgId) return;

    let cancel = false;

    const fetchUrl = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_CLOUD_IMG}/file/code/${encodeURIComponent(imgId)}`
        );
        const data = await res.json();
        if (!cancel) setUrl(data.presigned_url);
      } catch {
        if (!cancel) setUrl(null);
      }
    };

    fetchUrl();

    return () => {
      cancel = true;
    };
  }, [imgId]);

  return url;
}
