import { ProductoPedido } from "@/types";
import React from "react";

interface ProductosPedidoListProps {
  productos: ProductoPedido[];
}

const ProductosPedidoList: React.FC<ProductosPedidoListProps> = ({
  productos,
}) => (
  <div className="flex flex-col gap-2 mt-2">
    {productos.map((prod) => (
      <div
        key={prod.id}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-md shadow-sm px-1 sm:px-3 py-2 border border-gray-100 gap-1 sm:gap-0"
      >
        <div className="flex flex-col w-full sm:w-auto">
          <span className="font-medium text-gray-800 text-sm sm:text-base break-words leading-tight">
            {prod.descripcion}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            Cantidad: {prod.cantidad_pedida}
          </span>
        </div>
        <div className="flex flex-col sm:flex-col items-start sm:items-end w-full sm:w-auto justify-between sm:justify-end gap-1 sm:gap-0 mt-1 sm:mt-0">
          {/* Descuentos si existen */}
          {[
            prod.descuento1,
            prod.descuento2,
            prod.descuento3,
            prod.descuento4,
          ].some(Boolean) && (
            <span className="inline-flex items-center py-0.5  text-green-700 text-xs font-medium whitespace-nowrap">
              Descuentos:{" "}
              {[
                prod.descuento1,
                prod.descuento2,
                prod.descuento3,
                prod.descuento4,
              ]
                .filter(Boolean)
                .join("% + ")}
              %
            </span>
          )}
          <span className="text-xl sm:text-base font-semibold text-blue-700 whitespace-nowrap">
            Total: $ {prod.precio.toFixed(2)}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default ProductosPedidoList;
