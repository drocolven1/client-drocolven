import { useEffect } from "react";
import { useProductosStore } from "../store/productos.store";

export const useProductos = (preciosmp: boolean = false) => {
  const productos = useProductosStore((s) => s.productos);
  const loading = useProductosStore((s) => s.loading);
  const error = useProductosStore((s) => s.error);
  const fetchProductos = useProductosStore((s) => s.fetchProductos);

  useEffect(() => {
    fetchProductos(preciosmp);
  }, [preciosmp]);

  return { productos, loading, error };
};
