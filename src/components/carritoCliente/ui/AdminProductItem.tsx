import React, { useState } from "react";
import { CarritoProducto } from "../types/types";
import { useCarritoStore } from "../store/carrito.storage";
import { usePresignedUrl } from "../hooks/usePresignedUrl";
import { ShoppingCart, Package, Tag, FlaskConical } from "lucide-react";

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

  const safeNumber = (val: any): number => {
    if (typeof val === "string") {
      const n = parseFloat(val.replace(",", ".").trim());
      return isNaN(n) ? 0 : n;
    }
    return typeof val === "number" ? val : 0;
  };

  const precioBaseDLDE = safeNumber(producto.precio) * (1 - safeNumber(producto.descuento1) / 100) * (1 - safeNumber(producto.descuento2) / 100);
  const precioNeto = precioBaseDLDE * (1 - safeNumber(descuentoCliente1) / 100) * (1 - safeNumber(descuentoCliente2) / 100);

  const handleAgregar = () => {
    const cantidadValida = Number(cantidadPedida || 0);
    if (cantidadValida <= 0) return;

    const productoFinal: CarritoProducto = {
      ...producto,
      precio: safeNumber(producto.precio),
      precio_n: Number(precioNeto.toFixed(4)),
      descuento3: safeNumber(descuentoCliente1),
      descuento4: safeNumber(descuentoCliente2),
      cantidad_pedida: cantidadValida,
    };

    agregar(productoFinal, cantidadValida);
    setCantidadPedida("");
  };

  return (
    <div className="group relative bg-white backdrop-blur-md transition-all duration-300 rounded-2xl p-4 flex flex-col md:flex-row gap-6 items-center">
      
      {/* 1. SECCIÓN IMAGEN */}
      <div className="relative flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
        {imgLoading ? (
          <div className="w-full h-full bg-slate-800 animate-pulse" />
        ) : imgUrl ? (
          <img src={imgUrl} alt={producto.descripcion} className="w-full h-full object-contain p-2" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
            <Package className="w-8 h-8 opacity-20" />
            <span className="text-[10px] font-bold uppercase mt-1">Sin Imagen</span>
          </div>
        )}
        {/* Badge de Laboratorio o Categoría */}
        <div className="absolute top-0 left-0 bg-green-800 backdrop-blur-md px-2 py-1 rounded-br-lg border-r border-b border-white/10">
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">
            {producto.laboratorio || "Gral"}
          </span>
        </div>
      </div>

      {/* 2. INFORMACIÓN PRINCIPAL */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="text-2xl font-bold leading-tight truncate group-hover:text-blue-800 transition-colors">
              {producto.descripcion}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm">
              <span className="flex items-center gap-1 font-mono bg-slate-700 text-white px-2 py-0.5 rounded border border-slate-700">
                <Tag className="w-3 h-3" /> {producto.codigo}
              </span>
              <span className="flex items-center gap-1 text-primary font-bold uppercase text-md">
                <FlaskConical className="w-3 h-3" /> F.V. {producto.fv}
              </span>
            </div>
          </div>

        </div>

        {/* 3. GRID DE DESCUENTOS Y PRECIOS */}
        <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
          
          <div className="space-y-3">
            {/* Badges de Descuentos */}
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-900 text-md font-bold">DL {producto.descuento1}%</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-900 text-md font-bold">DE {producto.descuento2}%</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-md font-bold">DC {descuentoCliente1}%</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-md font-bold">PP {descuentoCliente2}%</span>
            </div>
            
            <div className="flex items-baseline gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 uppercase font-bold">Lista</span>
                <span className="text-slate-400 line-through text-2xl">${Number(producto.precio).toFixed(2)}</span>
              </div>
              <div className="flex flex-col border-l border-slate-800 pl-4">
                <span className="text-sm text-indigo-400 uppercase font-bold tracking-widest">Precio Neto</span>
                <span className="text-3xl font-black tracking-tight">
                  ${precioNeto.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 4. ACCIÓN: AGREGAR */}
          <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
            <input
              type="number"
              min={1}
              placeholder="0"
              value={cantidadPedida}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setCantidadPedida(Number.isNaN(v) ? "" : Math.max(0, v));
              }}
              className="w-16 bg-transparent text-center text-white font-bold text-lg focus:outline-none placeholder:text-slate-700"
            />
            <button
              onClick={handleAgregar}
              disabled={!cantidadPedida || Number(cantidadPedida) <= 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white p-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-900/20"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductItem;