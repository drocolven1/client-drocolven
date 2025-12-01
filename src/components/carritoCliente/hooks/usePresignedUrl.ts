// src/hooks/usePresignedUrl.ts
import { useEffect, useState } from "react";

type CacheEntry = {
  url: string;
  expiresAt: number; // epoch ms
};

const CACHE_KEY = "img_presigned_cache_v1";
// default TTL fallback (ms) if backend expiry unknown: 55 minutes
const DEFAULT_TTL_MS = 55 * 60 * 1000;

function readCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CacheEntry>;
  } catch {
    return {};
  }
}
function writeCache(cache: Record<string, CacheEntry>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
}

/**
 * usePresignedUrl
 * @param id nombre/clave del archivo (ej: codigo de producto)
 * @returns { url: string | null, loading: boolean, error?: string }
 */
export function usePresignedUrl(id?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    const cache = readCache();
    const entry = cache[id];

    if (entry && entry.expiresAt > Date.now()) {
      setUrl(entry.url);
      setLoading(false);
      setError(null);
      return;
    }

    // not cached or expired -> fetch pre-signed URL
    setLoading(true);
    setError(null);

    const base = import.meta.env.VITE_CLOUD_IMG;
    if (!base) {
      setError("VITE_CLOUD_IMG no definido");
      setLoading(false);
      return;
    }

    const fetchUrl = `${base.replace(/\/$/, "")}/file/code/${encodeURIComponent(id)}`;

    (async () => {
      try {
        const res = await fetch(fetchUrl, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `HTTP ${res.status}`);
        }
        const json = await res.json();
        const presigned = (json?.presigned_url as string) || json?.url || null;
        if (!presigned) throw new Error("No presigned_url in response");

        // store in cache with expiry based on default TTL (server created with 3600s)
        const expiresAt = Date.now() + DEFAULT_TTL_MS;
        const newCache = { ...readCache(), [id]: { url: presigned, expiresAt } };
        writeCache(newCache);

        if (mounted) {
          setUrl(presigned);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Error obteniendo imagen");
          setUrl(null);
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  return { url, loading, error };
}
