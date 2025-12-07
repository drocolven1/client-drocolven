// src/components/Admin/ProductList.tsx

import React, { useState, useEffect, useRef } from "react";
import AdminProductItem from "./AdminProductItem";
import type { CarritoProducto } from "../types/types";

interface ProductListProps {
  productos: CarritoProducto[];
  descuentoCliente1: number;
  descuentoCliente2: number;
  loading: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  productos,
  descuentoCliente1,
  descuentoCliente2,
  loading,
}) => {
  const [visibleCount, setVisibleCount] = useState(20); // Cantidad inicial de productos renderizados
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Manejar scroll para incrementar visibleCount
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        // Cargar más productos a medida que se acerca al final
        setVisibleCount((prev) => Math.min(prev + 20, productos.length));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [productos.length]);

  if (productos.length === 0 && !loading) {
    return <div className="p-4 text-center text-gray-500">No hay productos</div>;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-y-auto max-h-[85vh]"
    >
      {productos.slice(0, visibleCount).map((producto) => (
        <div key={producto.codigo} className="p-3">
          <div className="w-full shadow-md rounded-2xl p-4 hover:shadow-lg transition bg-gray-50">
            <AdminProductItem
              producto={producto}
              descuentoCliente1={descuentoCliente1}
              descuentoCliente2={descuentoCliente2}
            />
          </div>
        </div>
      ))}

      {loading && (
        <div className="text-center py-4 text-blue-600">
          Cargando productos...
        </div>
      )}

      {!loading && visibleCount >= productos.length && productos.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          Fin de la lista de productos.
        </div>
      )}
    </div>
  );
};

export default ProductList;
