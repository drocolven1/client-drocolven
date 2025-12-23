import { useAuth } from "@/hooks/useAuth";
import { usePedidosDeuda } from "@/hooks/useDeuda";
import { Wallet, Receipt, AlertCircle} from "lucide-react";

export function Deuda() {
  const { user } = useAuth();
  const { pedidos, loading, error, totalDeuda } = usePedidosDeuda({
    estadoDeuda: "pendiente",
    rifCliente: user?.rif ?? "",
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  });

  // Estado de Carga (Skeleton UI)
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl w-full min-w-[200px] animate-pulse">
        <div className="w-10 h-10 bg-slate-800 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-800 rounded w-20" />
          <div className="h-6 bg-slate-800 rounded w-32" />
        </div>
      </div>
    );
  }

  // Estado de Error
  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Error al cargar deuda</span>
      </div>
    );
  }

  // Estado Sin Deuda (Opcional, si total es 0)
  if (totalDeuda === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl">
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

  // Estado Principal
  return (
    <div className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-all duration-300 rounded-2xl p-4 shadow-lg">
      
      {/* Efecto de fondo sutil */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 blur-2xl rounded-full group-hover:bg-rose-500/20 transition-all" />

      <div className="flex items-center gap-4 relative z-10">
        {/* Icono */}
        <div className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700 group-hover:border-rose-500/20 group-hover:bg-rose-950/30 transition-colors">
          <Receipt className="w-6 h-6 text-rose-400" />
        </div>

        {/* Información */}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
            Deuda Pendiente
          </span>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              ${totalDeuda.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {pedidos.length} {pedidos.length === 1 ? 'Pedido' : 'Pedidos'}
            </span>
            <span className="text-[10px] text-slate-500">por procesar</span>
          </div>
        </div>
      </div>
    </div>
  );
}