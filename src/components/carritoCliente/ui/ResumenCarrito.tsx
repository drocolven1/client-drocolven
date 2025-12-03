// src/components/ResumenCarrito.tsx

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Cliente } from "../types/types";
import { useEnviarTransaccion } from "../hooks/useEnviarTransaccion";
import { useCarritoStore } from "../store/carrito.storage";

interface Props {
  cliente: Cliente | null;
  titulo?: string;
  onTotalizar?: () => void;
}

export const ResumenCarrito = ({
  cliente,
  titulo = "RESUMEN DEL PEDIDO",
  onTotalizar,
}: Props) => {
  const navigate = useNavigate();
  const { ejecutar: enviarTransaccion } = useEnviarTransaccion();

  const carrito = useCarritoStore((s) => s.carrito);
  const limpiarCarrito = useCarritoStore((s) => s.limpiar);
  const eliminar = useCarritoStore((s) => s.eliminar);

  const [observacion, setObservacion] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // -----------------------------------
  // Cálculos
  // -----------------------------------

  const subtotal = useMemo(
    () => carrito.reduce((acc, p) => acc + p.precio * p.cantidad_pedida, 0),
    [carrito]
  );

  const totalDLDE = useMemo(
    () =>
      carrito.reduce((acc, p) => {
        const base =
          p.precio *
          (1 - (p.descuento1 ?? 0) / 100) *
          (1 - (p.descuento2 ?? 0) / 100);
        return acc + base * p.cantidad_pedida;
      }, 0),
    [carrito]
  );

  const total = useMemo(
    () =>
      carrito.reduce((acc, p) => {
        const precio = p.precio_n ?? p.precio;
        return acc + precio * p.cantidad_pedida;
      }, 0),
    [carrito]
  );

  const descuentoTotal = subtotal - total;

  // -----------------------------------
  // ESC para cerrar modal
  // -----------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) =>
      e.key === "Escape" && setConfirmModalVisible(false);

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // -----------------------------------
  // Confirmar pedido
  // -----------------------------------
  const handleConfirmarPedido = useCallback(async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    let usuarioActual;
    try {
      const data = localStorage.getItem("cliente-storage");
      usuarioActual = data ? JSON.parse(data) : null;
      if (!usuarioActual) throw new Error("Usuario no encontrado");
    } catch {
      alert("No se pudo validar el usuario.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // --------------------
      // 1) Crear pedido
      // --------------------
      const payloadPedido = {
        cliente: cliente?.descripcion ?? "Cliente no seleccionado",
        rif: cliente?.rif ?? "RIF no seleccionado",
        observacion,
        subtotal: Number(subtotal.toFixed(2)),
        total: Number(total.toFixed(2)),
        estado: "nuevo",
        descuento_cliente1: cliente?.descuento1 ?? 0,
        descuento_cliente2: cliente?.descuento2 ?? 0,
        productos: carrito.map((p) => ({
          codigo: p.codigo,
          descripcion: p.descripcion,
          precio: Number(p.precio.toFixed(4)),
          descuento1: p.descuento1 ?? 0,
          descuento2: p.descuento2 ?? 0,
          descuento3: p.descuento3 ?? 0,
          descuento4: p.descuento4 ?? 0,
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
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/pedidos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadPedido),
      });

      const pedido = await res.json();
      if (!res.ok) throw new Error(pedido.message || "Error creando pedido.");

      // --------------------
      // 2) Crear transacción
      // --------------------
      // const mov: TransaccionPayload = {
      //   tipo_movimiento: "pedido",
      //   usuario: usuarioActual.email,
      //   observaciones: `Descargo por pedido N° ${pedido.pedido_id}. ${observacion}`,
      //   documento_origen: pedido.pedido_id.toString(),
      //   productos: carrito.map((p) => ({
      //     producto_codigo: p.codigo,
      //     cantidad: p.cantidad_pedida,
      //   })),
      // };

      // await enviarTransaccion(mov);

      alert("Pedido registrado correctamente.");
      onTotalizar?.();

      limpiarCarrito();
      setConfirmModalVisible(false);
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido.";
      setError(msg);
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [carrito, cliente, subtotal, total, observacion, enviarTransaccion, limpiarCarrito, navigate, onTotalizar]);

  // -----------------------------------
  // Render
  // -----------------------------------

  return (
    <div className="bg-white p-6 rounded-2xl max-w-4xl mx-auto border w-full space-y-6">
      <h2 className="text-center text-2xl font-bold">{titulo}</h2>

      {cliente && (
        <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm border border-blue-100 flex gap-4">
          <p><strong>Cliente:</strong> {cliente.encargado}</p>
          <p><strong>RIF:</strong> {cliente.rif}</p>
        </div>
      )}

      {/* Lista de productos */}
      {carrito.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-gray-500">
          <p className="text-lg">No hay productos agregados</p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-2 space-y-4">
          {carrito.map((p) => (
            <div key={p.codigo} className="flex justify-between border-b pb-3">
              <div>
                <p className="font-semibold">{p.descripcion}</p>
                <p className="text-xs text-gray-500">
                  Cant: {p.cantidad_pedida} — ${(p.precio_n ?? p.precio).toFixed(2)} c/u
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">
                  {((p.precio_n ?? p.precio) * p.cantidad_pedida).toFixed(2)}
                </span>

                <button
                  onClick={() => eliminar(p.codigo)}
                  className="text-gray-400 hover:text-red-500"
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totales */}
      <div className="border-t pt-4 space-y-2 text-right">
        <div>Subtotal: <strong>${subtotal.toFixed(2)}</strong></div>
        <div>Total DL+DE: <strong>${totalDLDE.toFixed(2)}</strong></div>
        <div>Descuento: <strong>- ${descuentoTotal.toFixed(2)}</strong></div>
        <div className="text-lg font-bold">Total: ${total.toFixed(2)}</div>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          onClick={() => setConfirmModalVisible(true)}
        >
          Totalizar Pedido
        </button>
      </div>

      {/* Modal */}
      {confirmModalVisible && (
        <div
          ref={overlayRef}
          className="fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-sm z-50"
          onClick={(e) => e.target === overlayRef.current && setConfirmModalVisible(false)}
        >
          <div ref={modalRef} className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-bold border-b pb-3">Confirmar Pedido</h3>

            <label className="block text-sm mt-4 font-medium">Observación</label>
            <textarea
              className="border p-2 w-full rounded"
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="bg-gray-200 px-4 py-2 rounded"
                onClick={() => setConfirmModalVisible(false)}
              >
                Cancelar
              </button>

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
                onClick={handleConfirmarPedido}
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : "Confirmar"}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
