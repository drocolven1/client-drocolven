import { useCreditManager } from "@/hooks/useCreditos";
import { useEffect, useState } from "react";
import { CreditCard, TrendingUp } from "lucide-react";

export function CreditDisplay({ rif }: { rif: string }) {
  const [credito, setCredito] = useState(0);
  const [loading, setLoading] = useState(false);
  const { getClienteByRif } = useCreditManager();

  useEffect(() => {
    if (rif) {
      setLoading(true);
      getClienteByRif(rif)
        .then((cliente) => {
          setCredito(cliente?.limite_credito || 0);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [rif]);

  // Estado de Carga (Skeleton UI)
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl w-full min-w-[200px] animate-pulse">
        <div className="w-10 h-10 bg-slate-800 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-800 rounded w-16" />
          <div className="h-6 bg-slate-800 rounded w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 rounded-2xl p-4 shadow-lg">
      
      {/* Efecto de fondo sutil (Glow) */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-all" />

      <div className="flex items-center gap-4 relative z-10">
        {/* Icono */}
        <div className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-xl group-hover:border-indigo-500/20 group-hover:bg-indigo-950/30 transition-colors">
          <CreditCard className="w-6 h-6 text-indigo-400" />
        </div>

        {/* Información */}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
            Línea Disponible
          </span>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              ${credito.toLocaleString()}
            </span>
          </div>

          {/* Indicador opcional decorativo */}
          <div className="flex items-center gap-1.5 mt-1">
             <TrendingUp className="w-3 h-3 text-emerald-400" />
             <span className="text-[10px] text-slate-500">Saldo a favor habilitado</span>
          </div>
        </div>
      </div>
    </div>
  );
}