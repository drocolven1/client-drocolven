// src/components/InfoClientePage.tsx
import ClientLayout from "@/layouts/Client";
import React, { useState, useEffect } from "react";
import {
  User2,
  Mail,
  CalendarClock,
  Percent,
  Shield,
  CreditCard,
  AlertCircle, // 🆕 Icono de crédito
} from "lucide-react";
import { useCreditManager } from "@/hooks/useCreditos";
import { Deuda } from "@/components/Deuda";

interface ClienteSeleccionado {
  id: string;
  name: string;
  email: string;
  descripcion: string;
  descuento1: number;
  descuento2: number;
  rif: string;
  exp: number;
}

interface StorageData {
  state: {
    clientes: any[];
    clienteSeleccionado: ClienteSeleccionado;
  };
  version: number;
}

const STORAGE_KEY = "cliente-storage";

const InfoClientePage: React.FC = () => {
  const [cliente, setCliente] = useState<ClienteSeleccionado>();
  const [credito, setCredito] = useState<any>(null); // 🆕 Estado para crédito
  const [loading, setLoading] = useState(true);
  const [creditoLoading, setCreditoLoading] = useState(false); // 🆕 Loading específico
  const [error, setError] = useState<string | null>(null);
  const { getClienteByRif } = useCreditManager();

  // 🆕 Función corregida para obtener crédito (async/await)
  const credito_cliente = async (rif: string) => {
    try {
      setCreditoLoading(true);
      const res_credito = await getClienteByRif(rif); // Ahora await
      setCredito(res_credito);
      console.log("✅ Crédito cargado:", res_credito);
    } catch (error) {
      console.error("❌ Error cargando crédito:", error);
      setError("Error al cargar información de crédito");
    } finally {
      setCreditoLoading(false);
    }
  };

  useEffect(() => {
    const initCliente = async () => {
      try {
        const storageData = localStorage.getItem(STORAGE_KEY);

        if (!storageData) {
          setError("No hay cliente seleccionado almacenado");
          setLoading(false);
          return;
        }

        const parsedData: StorageData = JSON.parse(storageData);

        if (!parsedData?.state?.clienteSeleccionado) {
          setError("No se encontró clienteSeleccionado en el almacenamiento");
          setLoading(false);
          return;
        }

        const now = Math.floor(Date.now() / 1000);
        if (
          parsedData.state.clienteSeleccionado.exp &&
          parsedData.state.clienteSeleccionado.exp < now
        ) {
          setError("Sesión del cliente expirada");
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }

        setCliente(parsedData.state.clienteSeleccionado);

        // 🆕 Cargar crédito DESPUÉS de tener el cliente
        await credito_cliente(parsedData.state.clienteSeleccionado.rif);

        setLoading(false);
      } catch (err: any) {
        setError("Error al leer datos del almacenamiento local");
        console.error("Error parsing cliente-storage:", err);
        setLoading(false);
      }
    };

    initCliente();
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-black/30 to-transparent">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6" />
          <div className="text-white text-xl animate-pulse tracking-wide">
            Cargando cliente...
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error || !cliente) {
    return (
      <ClientLayout>
        <div className="flex flex-col justify-center items-center h-screen p-8 text-white">
          <div className="text-6xl mb-8 opacity-20">
            <User2 />
          </div>
          <div className="text-3xl md:text-4xl font-black text-center bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-8 max-w-2xl mx-auto px-4">
            {error || "No hay cliente seleccionado"}
          </div>
        </div>
      </ClientLayout>
    );
  }

  const timeLeft = cliente.exp
    ? Math.max(0, cliente.exp - Math.floor(Date.now() / 1000))
    : 0;
  const hoursLeft = Math.floor(timeLeft / 3600);
  const minutesLeft = Math.floor((timeLeft % 3600) / 60);
  const isExpired = timeLeft === 0;

  return (
  <ClientLayout>
      <div className="min-h-full w-full bg-[#0f172a] text-slate-200 relative overflow-hidden selection:bg-indigo-500/30">
        
        {/* Background Ambient Effects (Más sutiles) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen" />
          {/* Grid Pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
          
          {/* 1. HERO SECTION: Perfil del Cliente */}
          <div className="w-full bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />
             
             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  {/* Avatar Grande */}
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20">
                    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                      <User2 className="w-10 h-10 text-blue-400" />
                    </div>
                  </div>
                  
                  {/* Textos */}
                  <div className="space-y-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      {cliente.descripcion || cliente.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 font-medium">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>RIF: <span className="text-slate-200">{cliente.rif}</span></span>
                      </div>
                      <div className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer">
                        <Mail className="w-4 h-4" />
                        <span>{cliente.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Componente de Deuda integrado */}
                <div className="w-full lg:w-auto min-w-[280px]">
                   <div className="bg-slate-950/50 rounded-2xl p-1 border border-slate-800">
                      <Deuda /> 
                   </div>
                </div>
             </div>
          </div>

          {/* 2. GRID DE MÉTRICAS FINANCIERAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* CARD: Línea de Crédito */}
            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-8">
                <div>
                   <p className="text-indigo-300 font-medium uppercase tracking-wider text-sm mb-1">Línea de Crédito</p>
                   {creditoLoading ? (
                     <div className="h-10 w-32 bg-slate-700/50 animate-pulse rounded-lg"/>
                   ) : (
                     <h3 className="text-4xl font-bold text-white tracking-tight">
                       ${credito?.limite_credito?.toLocaleString() || "0"}
                     </h3>
                   )}
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                  <CreditCard className="w-6 h-6 text-indigo-400" />
                </div>
              </div>

              {/* Status Bar */}
              <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estado</span>
                    <span className={`${
                      credito?.estado_credito === 'activo' ? 'text-emerald-400' : 
                      credito?.estado_credito === 'pendiente' ? 'text-amber-400' : 'text-red-400'
                    } font-bold uppercase`}>
                      {credito?.estado_credito || 'Inactivo'}
                    </span>
                 </div>
                 {/* Progress bar visual (decorativa) */}
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      credito?.estado_credito === 'activo' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 w-full' : 'w-0'
                    }`} />
                 </div>
              </div>
            </div>

            {/* CARD: Descuentos */}
            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                   <p className="text-emerald-300 font-medium uppercase tracking-wider text-sm mb-1">Estructura de Descuentos</p>
                   {/* <h3 className="text-4xl font-bold text-white tracking-tight">
                     {Math.max(Number(cliente.descuento1 || 0), Number(cliente.descuento2 || 0))}% <span className="text-xl text-slate-500 font-normal">max</span>
                   </h3> */}
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <Percent className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                 <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/10 text-center">
                    <span className="block text-2xl font-bold text-white">{cliente.descuento1}%</span>
                    <span className="text-xs text-emerald-200/60 uppercase font-semibold">Comercial</span>
                 </div>
                 <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/10 text-center">
                    <span className="block text-2xl font-bold text-white">{cliente.descuento2}%</span>
                    <span className="text-xs text-emerald-200/60 uppercase font-semibold">Especial</span>
                 </div>
              </div>
            </div>

            {/* CARD: Sesión / Expiración (Más compacta) */}
            {cliente.exp && (
              <div className={`relative bg-slate-900/40 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 ${
                 isExpired 
                 ? 'border-red-500/50 shadow-red-900/20 shadow-2xl' 
                 : 'border-slate-700/50 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between mb-8">
                   <div>
                     <p className={`font-medium uppercase tracking-wider text-sm mb-1 ${isExpired ? 'text-red-400' : 'text-amber-300'}`}>
                       Sesión Activa
                     </p>
                     <h3 className={`text-4xl font-bold tracking-tight ${isExpired ? 'text-red-500' : 'text-white'}`}>
                       {isExpired ? "EXPIRADO" : `${hoursLeft}h ${minutesLeft}m`}
                     </h3>
                   </div>
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                      isExpired ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'
                   }`}>
                     {isExpired ? (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                     ) : (
                        <CalendarClock className="w-6 h-6 text-amber-400" />
                     )}
                   </div>
                </div>
                
                <div className="bg-slate-950/30 rounded-lg p-3 text-sm text-slate-400 text-center border border-slate-800">
                  {isExpired 
                    ? "Por favor, renueva tu token de acceso." 
                    : "El sistema cerrará sesión automáticamente al finalizar."
                  }
                </div>
              </div>
            )}
            
          </div>

          {/* 3. Footer / Acciones rápidas (Opcional, para llenar espacio si sobra) */}
          <div className="text-center pt-8 border-t border-slate-800/50">
            <p className="text-slate-500 text-sm">
              Última sincronización de datos: <span className="text-indigo-400 font-medium">Hace un momento</span>
            </p>
          </div>

        </div>
      </div>
    </ClientLayout>
  );
};

export default InfoClientePage;
