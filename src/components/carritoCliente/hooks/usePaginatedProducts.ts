// src/hooks/usePaginatedProducts.ts

import { useState, useEffect, useCallback } from "react";
import { CarritoProducto } from "../types/types";
import { useAuth } from "@/hooks/useAuth";

// Definimos un límite de ítems por página
const PAGE_LIMIT = 50;

interface PaginatedResponse {
  productos: CarritoProducto[];
  total_productos: number;
  total_pages: number;
}

export const usePaginatedProducts = () => {
  const { token } = useAuth();
  const [productos, setProductos] = useState<CarritoProducto[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const getAuthHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchProducts = useCallback(
    async (pageNum: number) => {
      if (!token || loading || !hasMore) return;

      setLoading(true);
      setError(null);

      try {
        const url = `${import.meta.env.VITE_API_URL}/productos/paginated/?page=${pageNum}&limit=${PAGE_LIMIT}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Error ${res.status} al obtener productos.`);
        }

        const data: PaginatedResponse = await res.json();

        setProductos((prev) => {
          // Filtra duplicados antes de concatenar (si la API puede devolverlos)
          const newProducts = data.productos.filter(
            (p) => !prev.some((ep) => ep.codigo === p.codigo)
          );
          return [...prev, ...newProducts];
        });

        // Si la página actual es la última, detener la carga
        setHasMore(pageNum < data.total_pages);
        setPage(pageNum + 1);
      } catch (err: any) {
        setError(err.message || "Error de conexión al cargar productos.");
        // Opcional: setHasMore(false); si el error es grave
      } finally {
        setLoading(false);
      }
    },
    [token, loading, hasMore, getAuthHeaders]
  );

  // Carga inicial (Página 1)
  useEffect(() => {
    // Solo carga la página 1 si no hay productos y tenemos token
    if (token && productos.length === 0 && !loading) {
      fetchProducts(1);
    }
  }, [token, fetchProducts, loading, productos.length]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchProducts(page);
    }
  }, [hasMore, loading, page, fetchProducts]);

  // Función para recargar la lista si cambian los parámetros de filtro/búsqueda
  const resetAndLoad = useCallback(() => {
    setProductos([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1);
  }, [fetchProducts]);

  return {
    productos,
    loading,
    error,
    hasMore,
    loadMore,
    resetAndLoad,
  };
};
