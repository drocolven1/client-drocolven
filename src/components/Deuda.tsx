import { useAuth } from "@/hooks/useAuth";
import { usePedidosDeuda } from "@/hooks/useDeuda";
import {
  Wallet,
  Receipt,
  AlertCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface DeudaProps {
  /**
   * Si es true, muestra el componente en una sola línea horizontal compacta.
   * Si es false (default), muestra una tarjeta con desglose detallado.
   */
  fila?: boolean;
}

export function Deuda({ fila = false }: DeudaProps) {
  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // 1. Obtener Deuda Pendiente
  const {
    pedidos: pedidosPendientes,
    loading: loadingPendiente,
    error: errorPendiente,
    totalDeuda: totalPendiente,
  } = usePedidosDeuda({
    estadoDeuda: "pendiente",
    rifCliente: user?.rif ?? "",
    baseURL,
  });

  // 2. Obtener Deuda Activa
  const {
    pedidos: pedidosActivos,
    loading: loadingActiva,
    error: errorActiva,
    totalDeuda: totalActiva,
  } = usePedidosDeuda({
    estadoDeuda: "activa",
    rifCliente: user?.rif ?? "",
    baseURL,
  });

  const isLoading = loadingPendiente || loadingActiva;
  const hasError = errorPendiente || errorActiva;
  const grandTotal = totalPendiente + totalActiva;

  // ==========================================
  // MODO FILA (Horizontal / Compacto)
  // ==========================================
  if (fila) {
    // Skeleton Fila
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 w-full h-12 bg-slate-900/50 border border-slate-800 rounded-lg px-4 animate-pulse">
          <div className="w-5 h-5 bg-slate-800 rounded-full" />
          <div className="h-4 bg-slate-800 rounded w-24" />
          <div className="ml-auto h-4 bg-slate-800 rounded w-16" />
        </div>
      );
    }

    // Error Fila
    if (hasError) {
      return (
        <div className="flex items-center gap-2 text-red-400 text-xs px-2 py-1 bg-red-950/20 rounded border border-red-900/30">
          <AlertCircle className="w-3 h-3" /> Error de carga
        </div>
      );
    }

    // Sin Deuda Fila
    if (grandTotal === 0) {
      return (
        <div className="flex items-center gap-2 text-emerald-400 px-3 py-1.5 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Al día</span>
        </div>
      );
    }

    // Contenido Principal Fila
    return (
      <div className="flex flex-row items-center gap-3 justify-between w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-5.5 hover:border-rose-500/30 transition-colors group">
        <div className="p-2 bg-slate-800 rounded-md group-hover:bg-rose-950/30 text-rose-400 transition-colors ">
          <Receipt className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3 pb-2">
            <div className="gap-2 flex flex-col justify-center items-center">
              <p className="text-sm text-slate-500 uppercase font-semibold tracking-wider leading-none mb-0.5">
                Total Deuda
              </p>
              <p className="text-2xl font-bold text-white leading-none">
                ${grandTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Desglose Miniatura a la derecha */}
          {/* <div className="flex items-center gap-2 text-md">
            {totalActiva > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-rose-950/30 border border-rose-500/20 rounded text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">
                  ${totalActiva.toLocaleString()}
                </span>
              </div>
            )}
            {totalPendiente > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-950/30 border border-amber-500/20 rounded text-amber-300">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">
                  ${totalPendiente.toLocaleString()}
                </span>
              </div>
            )}
          </div> */}
        </div>
      </div>
    );
  }

  // ==========================================
  // MODO TARJETA (Default / Detallado)
  // ==========================================

  // Skeleton Tarjeta
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl w-full animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-800 rounded w-20" />
            <div className="h-6 bg-slate-800 rounded w-32" />
          </div>
        </div>
        <div className="h-10 bg-slate-800 rounded-xl w-full mt-2" />
      </div>
    );
  }

  // Error Tarjeta
  if (hasError) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Error al cargar información de deuda</span>
      </div>
    );
  }

  // Sin Deuda Tarjeta
  if (grandTotal === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl h-full">
        <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-400">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <p className="text-emerald-400 font-semibold text-sm">Al día</p>
          <p className="text-slate-400 text-xs">Sin pagos pendientes</p>
        </div>
      </div>
    );
  }

  // Contenido Principal Tarjeta
  return (
    <div className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-all duration-300 rounded-2xl p-4 shadow-lg flex flex-col gap-4">
      {/* Efecto de fondo */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 blur-2xl rounded-full group-hover:bg-rose-500/20 transition-all" />

      {/* Encabezado */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700 group-hover:border-rose-500/20 group-hover:bg-rose-950/30 transition-colors">
          <Receipt className="w-6 h-6 text-rose-400" />
        </div>

        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
            Total a Pagar
          </span>
          <span className="text-2xl font-bold text-white tracking-tight">
            ${grandTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grilla de Desglose */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        {/* Deuda Activa */}
        <div
          className={`flex flex-col p-2 rounded-lg border ${totalActiva > 0 ? "bg-rose-950/20 border-rose-500/20" : "bg-slate-800/50 border-slate-700/50 opacity-60"}`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle
              className={`w-3 h-3 ${totalActiva > 0 ? "text-rose-400" : "text-slate-400"}`}
            />
            <span
              className={`text-[10px] font-medium uppercase ${totalActiva > 0 ? "text-rose-300" : "text-slate-400"}`}
            >
              Activa
            </span>
          </div>
          <span className="text-sm font-bold text-slate-200">
            ${totalActiva.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">
            {pedidosActivos.length}{" "}
            {pedidosActivos.length === 1 ? "pedido" : "pedidos"}
          </span>
        </div>

        {/* Deuda Pendiente */}
        <div
          className={`flex flex-col p-2 rounded-lg border ${totalPendiente > 0 ? "bg-amber-950/20 border-amber-500/20" : "bg-slate-800/50 border-slate-700/50 opacity-60"}`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Clock
              className={`w-3 h-3 ${totalPendiente > 0 ? "text-amber-400" : "text-slate-400"}`}
            />
            <span
              className={`text-[10px] font-medium uppercase ${totalPendiente > 0 ? "text-amber-300" : "text-slate-400"}`}
            >
              Pendiente
            </span>
          </div>
          <span className="text-sm font-bold text-slate-200">
            ${totalPendiente.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">
            {pedidosPendientes.length}{" "}
            {pedidosPendientes.length === 1 ? "pedido" : "pedidos"}
          </span>
        </div>
      </div>
    </div>
  );
}
