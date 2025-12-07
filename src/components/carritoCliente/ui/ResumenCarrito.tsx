import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useId,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, XCircle, ShoppingBag, Percent } from "lucide-react";
import { Cliente } from "../types/types";
import { useCarritoStore } from "../store/carrito.storage";
import { Button } from "@heroui/button";

//--------------------------------------
// UTILIDAD PARA FORMATO DE FECHA
//--------------------------------------
const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

//--------------------------------------
// SUBCOMPONENTE MEMOIZADO ULTRA-RESPONSIVE
//--------------------------------------

const ItemCarrito = memo(
  ({
    producto,
    onEliminar,
  }: {
    producto: any;
    onEliminar: (id: string) => void;
  }) => {
    const precioNeto = producto.precio_n ?? producto.precio;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 border-b border-gray-100 last:border-b-0 last:pb-0 group gap-3 sm:gap-4 hover:bg-gray-50 transition-colors duration-200">
        <div className="flex flex-col flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">
            {producto.descripcion}
          </h4>
          <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs">
              {producto.cantidad_pedida}
            </span>
            <span className="hidden sm:inline">×</span>
            <span className="font-medium text-gray-600">
              ${precioNeto.toFixed(2)} c/u
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto sm:min-w-0 justify-between sm:justify-end">
          <span className="text-base sm:text-lg lg:text-xl font-black text-gray-900 bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text min-w-[80px] text-right">
            ${(precioNeto * producto.cantidad_pedida).toFixed(2)}
          </span>

          <button
            onClick={() => onEliminar(producto.codigo)}
            className="flex-shrink-0 p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
            aria-label={`Eliminar ${producto.descripcion}`}
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    );
  }
);

ItemCarrito.displayName = "ItemCarrito";

//--------------------------------------
// HOOK PERSONALIZADO PARA MODAL RESPONSIVE
//--------------------------------------

const useModal = (initialVisible = false) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (isVisible) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "";
  //   }
  // }, [isVisible]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVisible(false);
    };
    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isVisible]);

  const open = useCallback(() => setIsVisible(true), []);
  const close = useCallback(() => setIsVisible(false), []);

  return { isVisible, open, close, overlayRef, modalRef };
};

//--------------------------------------
// COMPONENTE PRINCIPAL ULTRA-RESPONSIVE
//--------------------------------------

interface Props {
  cliente: Cliente | null;
  titulo?: string;
  onTotalizar?: () => void;
}

export const ResumenCarrito: React.FC<Props> = ({ cliente, onTotalizar }) => {
  const navigate = useNavigate();

  const carrito = useCarritoStore((s) => s.carrito);
  const limpiarCarrito = useCarritoStore((s) => s.limpiar);
  const eliminar = useCarritoStore((s) => s.eliminar);

  const [observacion, setObservacion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalId = useId();

  const { isVisible, open, close, overlayRef, modalRef } = useModal();

  //--------------------------------------
  // CÁLCULOS OPTIMIZADOS CON TODOS LOS DESCUENTOS
  //--------------------------------------

  const totals = useMemo(() => {
    let subtotal = 0;
    let total = 0;
    let totalDLDE = 0;
    let descuento1Total = 0;
    let descuento2Total = 0;
    let descuento3Total = 0;
    let descuento4Total = 0;
    let descuentoCliente1Total = 0;
    let descuentoCliente2Total = 0;

    carrito.forEach((p) => {
      const cantidad = p.cantidad_pedida;

      // Subtotal sin descuentos
      subtotal += p.precio * cantidad;

      // Descuento 1-4 por producto
      const precioD1 = p.precio * (1 - (p.descuento1 ?? 0) / 100);
      descuento1Total += (p.precio - precioD1) * cantidad;

      const precioD2 = precioD1 * (1 - (p.descuento2 ?? 0) / 100);
      descuento2Total += (precioD1 - precioD2) * cantidad;

      const precioD3 = precioD2 * (1 - (p.descuento3 ?? 0) / 100);
      descuento3Total += (precioD2 - precioD3) * cantidad;

      const precioD4 = precioD3 * (1 - (p.descuento4 ?? 0) / 100);
      descuento4Total += (precioD3 - precioD4) * cantidad;

      // Total neto por producto (precio_n)
      const precioNeto = p.precio_n ?? precioD4;
      total += precioNeto * cantidad;

      // Total DL+DE (solo descuentos 1 y 2)
      const precioDLDE =
        p.precio *
        (1 - (p.descuento1 ?? 0) / 100) *
        (1 - (p.descuento2 ?? 0) / 100);
      totalDLDE += precioDLDE * cantidad;
    });

    // Descuentos cliente aplicados al total neto
    const totalNeto = total;
    const totalCliente1 =
      totalNeto * (1 - (Number(cliente?.descuento1) ?? 0) / 100);
    descuentoCliente1Total = totalNeto - totalCliente1;

    const totalCliente2 =
      totalCliente1 * (1 - (Number(cliente?.descuento2) ?? 0) / 100);
    descuentoCliente2Total = totalCliente1 - totalCliente2;

    const totalFinal = totalCliente2;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      total: Number(totalNeto.toFixed(2)),
      totalDLDE: Number(totalDLDE.toFixed(2)),
      totalFinal: Number(totalFinal.toFixed(2)),
      descuento1: Number(descuento1Total.toFixed(2)),
      descuento2: Number(descuento2Total.toFixed(2)),
      descuento3: Number(descuento3Total.toFixed(2)),
      descuento4: Number(descuento4Total.toFixed(2)),
      descuentoCliente1: Number(descuentoCliente1Total.toFixed(2)),
      descuentoCliente2: Number(descuentoCliente2Total.toFixed(2)),
      totalAhorrado: Number((subtotal - totalFinal).toFixed(2)),
    };
  }, [carrito, cliente]);

  // Lista memoizada
  const listaProductos = useMemo(
    () =>
      carrito.map((prod) => (
        <ItemCarrito key={prod.codigo} producto={prod} onEliminar={eliminar} />
      )),
    [carrito, eliminar]
  );

  //--------------------------------------
  // FUNCIONES OPTIMIZADAS
  //--------------------------------------

  const buildProductosPayload = useCallback(
    (items: any[]) =>
      items.map((p) => ({
        codigo: p.codigo,
        descripcion: p.descripcion,
        precio: Number(p.precio.toFixed(4)),
        descuento1: Number((p.descuento1 ?? 0).toFixed(4)),
        descuento2: Number((p.descuento2 ?? 0).toFixed(4)),
        descuento3: Number((p.descuento3 ?? 0).toFixed(4)),
        descuento4: Number((p.descuento4 ?? 0).toFixed(4)),
        precio_n: Number((p.precio_n ?? p.precio).toFixed(4)),
        total_Neto: Number(
          ((p.precio_n ?? p.precio) * p.cantidad_pedida).toFixed(4)
        ),
        subtotal: Number((p.precio * p.cantidad_pedida).toFixed(4)),
        cantidad_pedida: p.cantidad_pedida,
        existencia: p.existencia,
        nacional: p.nacional,
        fv: p.fv,
        dpto: p.dpto,
        laboratorio: p.laboratorio,
      })),
    []
  );

  const getUsuarioActual = useCallback(() => {
    try {
      const data = localStorage.getItem("cliente-storage");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  //--------------------------------------
  // MANEJADOR PRINCIPAL CON FECHA ✅
  //--------------------------------------

  const handleConfirmarPedido = useCallback(async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const usuarioActual = getUsuarioActual();
    if (!usuarioActual) {
      alert("No se pudo validar el usuario.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // ✅ FECHA ACTUAL EN FORMATO %Y-%m-%d %H:%M:%S
      const fechaActual = getCurrentDateTime();

      const payloadPedido = {
        cliente: cliente?.descripcion ?? "Cliente no seleccionado",
        rif: cliente?.rif ?? "RIF no seleccionado",
        observacion,
        fecha: fechaActual, // ✅ CAMPO FECHA AGREGADO
        subtotal: totals.subtotal,
        total: totals.totalFinal,
        estado: "nuevo",
        descuento_cliente1: cliente?.descuento1 ?? 0,
        descuento_cliente2: cliente?.descuento2 ?? 0,
        productos: buildProductosPayload(carrito),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/pedidos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadPedido),
      });

      const pedido = await res.json();
      if (!res.ok) throw new Error(pedido.message || "Error creando pedido.");

      alert("✅ Pedido registrado correctamente.");
      onTotalizar?.();
      limpiarCarrito();
      close();
      setObservacion("");
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [
    carrito,
    cliente,
    totals,
    observacion,
    buildProductosPayload,
    getUsuarioActual,
    limpiarCarrito,
    close,
    navigate,
    onTotalizar,
  ]);

  //--------------------------------------
  // RENDER ULTRA-RESPONSIVE CON DESCUENTOS DETALLADOS
  //--------------------------------------

  return (
    <div className="mx-auto">
      {/* Cliente Info Responsive */}
      {cliente && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-1 sm:p-2 rounded-xl sm:rounded-2xl mb-2 sm:mb-4">
          <span className="font-bold text-blue-900 min-w-0 truncate">
            Cliente: {cliente.descripcion.toUpperCase()}
          </span>
          <span className="font-bold text-blue-900">RIF:</span>
          <span className="font-mono bg-blue-100 px-2 py-1 sm:px-3 sm:py-1 rounded-lg font-semibold text-xs sm:text-sm">
            {cliente.rif}
          </span>
        </div>
      )}

      {/* Productos Responsive */}
      <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8">
        {carrito.length === 0 ? (
          <div className="flex flex-col items-center py-12 sm:py-16 text-center text-gray-400">
            <div className="animate-bounce">
              <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 text-gray-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-500 mb-2">
              Carrito vacío
            </h3>
            <p className="text-sm">Agrega productos para continuar</p>
          </div>
        ) : (
          <div className="max-h-72 sm:max-h-80 lg:max-h-96 overflow-y-auto pr-2 sm:pr-4 -mr-2 sm:-mr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {listaProductos}
          </div>
        )}
      </div>

      {/* Totales DETALLADOS Responsive */}
      <div className="pt-6 sm:pt-8 border-t border-gray-100 space-y-3 sm:space-y-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
          <div className="space-y-2 sm:space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-xs sm:text-sm lg:text-base">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-900">
                ${totals.subtotal.toFixed(2)}
              </span>
            </div>

            {/* Total DL+DE */}
            <div className="flex justify-between text-xs sm:text-sm lg:text-base">
              <span className="text-gray-600">Total DL+DE:</span>
              <span className="font-semibold text-gray-900">
                ${totals.totalDLDE.toFixed(2)}
              </span>
            </div>

            {/* ✅ DESCUENTOS DETALLADOS */}
            <div className="space-y-1 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs sm:text-sm text-red-600">
                <span className="font-bold flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Descuentos Producto:
                </span>
                <span className="font-bold">
                  -${totals.descuento1.toFixed(2)}
                </span>
              </div>

              {totals.descuento2 > 0 && (
                <div className="flex justify-between text-xs pl-6 text-red-600/90">
                  <span>D2:</span>
                  <span>-${totals.descuento2.toFixed(2)}</span>
                </div>
              )}

              {totals.descuento3 > 0 && (
                <div className="flex justify-between text-xs pl-6 text-red-600/80">
                  <span>D3:</span>
                  <span>-${totals.descuento3.toFixed(2)}</span>
                </div>
              )}

              {totals.descuento4 > 0 && (
                <div className="flex justify-between text-xs pl-6 text-red-600/80">
                  <span>D4:</span>
                  <span>-${totals.descuento4.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* ✅ DESCUENTOS CLIENTE */}
            {cliente &&
              cliente.descuento1 &&
              (Number(cliente.descuento1) > 0 ||
                Number(cliente.descuento2) > 0) && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-indigo-600">
                    <span className="font-bold flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      Descuentos Cliente:
                    </span>
                    <span className="font-bold">
                      -${totals.descuentoCliente1.toFixed(2)}
                    </span>
                  </div>

                  {cliente.descuento2 && Number(cliente.descuento2) > 0 && (
                    <div className="flex justify-between text-xs pl-6 text-indigo-600/90">
                      <span>C2:</span>
                      <span>-${totals.descuentoCliente2.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

            {/* TOTAL AHORRADO */}
            <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4 bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-xl">
              <div className="flex items-center justify-between text-sm sm:text-lg font-bold text-emerald-700">
                <span>🎉 Total Ahorrado:</span>
                <span>${totals.totalAhorrado.toFixed(2)}</span>
              </div>
            </div>

            {/* TOTAL FINAL */}
            <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
              <div className="flex justify-between text-xl sm:text-2xl lg:text-3xl font-black">
                <span className="text-gray-900">Total Final:</span>
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  ${totals.totalFinal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center sm:justify-end">
          <Button
            onClick={limpiarCarrito}
            disabled={carrito.length === 0}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Limpiar Carrito
          </Button>

          <Button
            onClick={open}
            disabled={carrito.length === 0}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Totalizar Pedido
          </Button>
        </div>
      </div>

      {isVisible && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${modalId}-title`}
          aria-describedby={`${modalId}-desc`}
          onClick={(e) => e.target === overlayRef.current && close()}
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100"
            role="document"
          >
            <div className="flex justify-between items-center p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
              <h2
                id={`${modalId}-title`}
                className="text-xl sm:text-2xl font-black text-gray-900"
              >
                Confirmar Pedido
              </h2>
              <button
                onClick={close}
                className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:scale-110 active:scale-95"
                aria-label="Cerrar modal"
              >
                <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor={`${modalId}-observacion`}
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Observación (opcional)
                </label>
                <textarea
                  id={`${modalId}-observacion`}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-vertical min-h-[100px] sm:min-h-[120px]"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  placeholder="Escribe cualquier observación sobre el pedido..."
                />
              </div>

              <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2 sm:pt-4">
                <Button
                  onClick={handleConfirmarPedido}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </Button>

                <Button
                  onClick={close}
                  disabled={isProcessing}
                  variant="light"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-200 disabled:opacity-50 min-h-[44px]"
                >
                  Cancelar
                </Button>
              </div>

              {error && (
                <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl">
                  <p className="text-red-800 text-sm text-center font-medium">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
