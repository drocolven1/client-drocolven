// src/components/Admin/ProductList.tsx
import React, { useCallback, useEffect, useState } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import AdminProductItem from "./AdminProductItem";
import type { CarritoProducto } from "../types/types";

interface ProductListProps {
  productos: CarritoProducto[];
  descuentoCliente1: number;
  descuentoCliente2: number;
  height?: number;
  itemHeight?: number;
}

export const ProductList: React.FC<ProductListProps> = ({
  productos,
  descuentoCliente1,
  descuentoCliente2,
  height,
  itemHeight = 160, // un poco más grande para el nuevo diseño
}) => {
  const [containerHeight, setContainerHeight] = useState<number>(
    height ?? Math.max(window.innerHeight - 260, 400)
  );

  useEffect(() => {
    if (height) {
      setContainerHeight(height);
      return;
    }
    const onResize = () =>
      setContainerHeight(Math.max(window.innerHeight - 260, 400));

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [height]);

  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const producto = productos[index];

      return (
        <div
          style={{
            ...style,
            padding: "10px 12px", // margen interno entre filas
          }}
        >
          <div className="w-full h-full bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition">
            <AdminProductItem
              producto={producto}
              descuentoCliente1={descuentoCliente1}
              descuentoCliente2={descuentoCliente2}
            />
          </div>
        </div>
      );
    },
    [productos, descuentoCliente1, descuentoCliente2]
  );

  if (productos.length === 0) {
    return <div className="p-4 text-center text-gray-500">No hay productos</div>;
  }

  return (
    <div className="w-full h-full bg-gray-100 rounded-xl overflow-hidden">
      <List
        height={containerHeight}
        itemCount={productos.length}
        itemSize={itemHeight + 20} 
        overscanCount={6}
        className="w-full"
      >
        {Row}
      </List>
    </div>
  );
};

export default ProductList;
