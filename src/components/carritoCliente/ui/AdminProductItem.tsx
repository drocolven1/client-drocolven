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
    return (
      base *
      (1 - safeNumber(descuentoCliente1) / 100) *
      (1 - safeNumber(descuentoCliente2) / 100)
    );
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
    <div className="flex flex-col md:flex-row items-stretch gap-4 p-2 rounded-lg">
      {/* Imagen */}
      <div className="flex-shrink-0 w-full md:w-44 h-48 md:h-auto flex items-center justify-center bg-white rounded-lg overflow-hidden border">
        {imgLoading ? (
          <div className="w-full h-full bg-gray-200" />
        ) : imgUrl ? (
          <img
            src={imgUrl}
            alt={producto.descripcion}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-xs text-gray-500 p-2 text-center">
            Sin imagen
          </div>
        )}
      </div>

      {/* Información y acciones */}
      <div className="flex-1 flex flex-row justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-extrabold text-gray-800">
              {producto.descripcion}
            </h3>
            <span className="text-lg text-primary-600">F.V. {producto.fv}</span>
          </div>

          <div className=" flex flex-col gap-2">
            <div className="mt-2 flex flex-wrap gap-2 items-center text-xl font-black">
              <span>Neto: ${safeNumber(producto.precio).toFixed(2)}</span>
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
            <div className="text-xl text-gray-700">
              Base DL+DE:{" "}
              <span className="font-medium">${precioBaseDLDE.toFixed(2)}</span>
            </div>
            <div className="text-3xl font-black">
              Total:{" "}
              <span className="font-bold text-green-700">
                ${precioNeto.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Cantidad y botón */}
        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={cantidadPedida}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isNaN(v)) setCantidadPedida("");
              else setCantidadPedida(Math.max(0, v));
            }}
            className="w-20 p-2 border rounded text-center border-gray-900"
            aria-label={`Cantidad de ${producto.descripcion}`}
          />
          <button
            onClick={handleAgregar}
            className="bg-primary-600 text-white px-4 py-2 rounded-md border border-primary-700 hover:bg-primary-700 transition"
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
