// src/components/AdminProductItem.tsx

import React, { useState } from "react";
import { CarritoProducto } from "../types/types";
import { useCarritoStore } from "../store/carrito.storage";
import { usePresignedUrl } from "../hooks/usePresignedUrl";

interface Props {
  producto: CarritoProducto;
  descuentoCliente1: number;
  descuentoCliente2: number;
}

export const AdminProductItem: React.FC<Props> = ({
  producto,
  descuentoCliente1,
  descuentoCliente2,
}) => {
  const [cantidadPedida, setCantidadPedida] = useState<number | "">("");
  const agregar = useCarritoStore((s) => s.agregar);
  const { url: imgUrl, loading: imgLoading } = usePresignedUrl(producto.codigo);

  // --- Función de seguridad para convertir cualquier valor a número ---
  const safeNumber = (val: any): number => {
    if (typeof val === "string") {
      const n = parseFloat(val.replace(",", ".").trim());
      return isNaN(n) ? 0 : n;
    }
    if (typeof val === "number") return val;
    return 0;
  };

  // --- Cálculos de precios ---
  const calcularPrecioBaseDLDE = (): number => {
    const precioNum = safeNumber(producto.precio);
    const desc1 = safeNumber(producto.descuento1);
    const desc2 = safeNumber(producto.descuento2);
    return precioNum * (1 - desc1 / 100) * (1 - desc2 / 100);
  };

  const calcularPrecioNeto = (): number => {
    const base = calcularPrecioBaseDLDE();
    return base *
      (1 - safeNumber(descuentoCliente1) / 100) *
      (1 - safeNumber(descuentoCliente2) / 100);
  };

  const precioBaseDLDE = calcularPrecioBaseDLDE();
  const precioNeto = calcularPrecioNeto();

  // --- Manejo de agregar al carrito ---
  const handleAgregar = () => {
    const cantidadValida = Number(cantidadPedida || 0);
    if (!cantidadValida || isNaN(cantidadValida) || cantidadValida <= 0) return;

    const productoFinal: CarritoProducto = {
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      precio: safeNumber(producto.precio),
      precio_n: Number(precioNeto.toFixed(4)),
      existencia: safeNumber(producto.existencia),
      descuento1: safeNumber(producto.descuento1),
      descuento2: safeNumber(producto.descuento2),
      descuento3: safeNumber(descuentoCliente1),
      descuento4: safeNumber(descuentoCliente2),
      cantidad_pedida: cantidadValida,
      nacional: producto.nacional,
      fv: producto.fv,
      dpto: producto.dpto,
      laboratorio: producto.laboratorio,
    };

    agregar(productoFinal, cantidadValida);
    setCantidadPedida("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Imagen */}
      <div className="flex-shrink-0 flex items-center justify-center h-full w-full md:w-44 md:h-full">
        {imgLoading ? (
          <div className="w-full h-24 md:w-44 md:h-44 animate-pulse bg-gray-200" />
        ) : imgUrl ? (
          <img
            src={imgUrl}
            alt={producto.descripcion}
            className="max-h-40 md:max-h-full w-auto object-contain"
          />
        ) : (
          <div className="text-xs text-gray-400 p-2 text-center">
            No hay imagen
          </div>
        )}
      </div>

      {/* Información y acciones */}
      <div className="flex flex-col md:flex-row justify-between w-full">
        <div>
          <h3 className="text-lg text-gray-800 font-bold">{producto.descripcion}</h3>

          <div className="mt-2 flex flex-wrap gap-2 items-center text-sm text-gray-600">
            <span>Precio base: ${safeNumber(producto.precio).toFixed(2)}</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              DL {safeNumber(producto.descuento1)}%
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              DE {safeNumber(producto.descuento2)}%
            </span>
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">
              DC {safeNumber(descuentoCliente1)}%
            </span>
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">
              PP {safeNumber(descuentoCliente2)}%
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="text-sm text-gray-500">
              <div>
                Base DL+DE: <span className="font-medium">${precioBaseDLDE.toFixed(2)}</span>
              </div>
              <div>
                Neto: <span className="font-bold text-green-600">${precioNeto.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cantidad y botón */}
        <div className="mt-4 flex items-center gap-3 flex-shrink-0">
          <input
            type="number"
            min={1}
            value={cantidadPedida}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isNaN(v)) setCantidadPedida("");
              else setCantidadPedida(Math.max(0, v));
            }}
            className="w-20 p-2 border rounded text-center"
            aria-label={`Cantidad de ${producto.descripcion}`}
          />
          <button
            onClick={handleAgregar}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            aria-label={`Agregar ${producto.descripcion}`}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductItem;
