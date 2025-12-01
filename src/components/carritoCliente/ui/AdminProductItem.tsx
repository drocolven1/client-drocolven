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

  const calcularPrecioBaseDLDE = (): number => {
    const { precio, descuento1 = 0, descuento2 = 0 } = producto;
    return precio * (1 - descuento1 / 100) * (1 - descuento2 / 100);
  };

  const calcularPrecioNeto = (): number => {
    return (
      calcularPrecioBaseDLDE() *
      (1 - (descuentoCliente1 || 0) / 100) *
      (1 - (descuentoCliente2 || 0) / 100)
    );
  };

  const precioBaseDLDE = calcularPrecioBaseDLDE();
  const precioNeto = calcularPrecioNeto();

  const handleAgregar = () => {
    const cantidadValida = Number(cantidadPedida || 0);
    if (!cantidadValida || isNaN(cantidadValida) || cantidadValida <= 0) return;

    const productoFinal: CarritoProducto = {
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      precio: producto.precio,
      precio_n: Number(precioNeto.toFixed(4)),
      existencia: producto.existencia,
      descuento1: producto.descuento1,
      descuento2: producto.descuento2,
      descuento3: descuentoCliente1,
      descuento4: descuentoCliente2,
      cantidad_pedida: cantidadValida,
      // opcionales:
      nacional: producto.nacional,
      fv: producto.fv,
      dpto: producto.dpto,
      laboratorio: producto.laboratorio,
    };

    agregar(productoFinal, cantidadValida);
    setCantidadPedida("");
  };

  return (
    <div className="flex">
      {imgLoading ? (
        <div className="w-full h-full animate-pulse bg-gray-200" />
      ) : imgUrl ? (
        <img
          src={imgUrl}
          alt={producto.descripcion}
          className="w-44 h-auto"
        />
      ) : (
        <div className="text-xs text-gray-400 p-2 text-center">
          No hay imagen
        </div>
      )}
      <div className="flex flex-row justify-between w-full">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {producto.descripcion}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2 items-center text-sm text-gray-600">
            <span>Precio base: ${producto.precio.toFixed(2)}</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              DL {producto.descuento1}%
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              DE {producto.descuento2}%
            </span>
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">
              DC {descuentoCliente1}%
            </span>
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">
              PP {descuentoCliente2}%
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="text-sm text-gray-500">
              <div>
                Base DL+DE:{" "}
                <span className="font-medium">
                  ${precioBaseDLDE.toFixed(2)}
                </span>
              </div>
              <div>
                Neto:{" "}
                <span className="font-bold">${precioNeto.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

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
