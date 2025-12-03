// src/components/carritoCliente/hooks/useProducts.ts

import { useEffect, useState } from "react";

const INVENTARIO_URL = `${import.meta.env.VITE_API_URL}/inventario_maestro/`;

export const useProductos = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(INVENTARIO_URL);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      // data.inventario_maestro es el array completo
      setProductos(data.inventario_maestro || []);
    } catch (err: any) {
      console.error("Error cargando inventario:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return {
    productos,
    loading,
    error,
    refresh: fetchProductos, // para recargar manualmente si se necesita
  };
};
