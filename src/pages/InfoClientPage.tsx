// src/components/InfoClientePage.tsx
import ClientLayout from "@/layouts/Client";
import React, { useState, useEffect } from "react";
import {
  User2,
  Mail,
  CalendarClock,
  Percent,
  Shield,
  DollarSign, // 🆕 Para límite de crédito
  CreditCard, // 🆕 Icono de crédito
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
      <div className="max-h-full p-8 lg:p-16 pb-24 relative overflow-y-auto overflow-x-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header Hero */}
          <div className="relative z-10 mb-20 lg:mb-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex flex-row items-start gap-5 justify-between w-full">
                <div className="flex flex-row items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/80 to-indigo-600/80 backdrop-blur-xl border border-blue-500/50 rounded-2xl mb-6 shadow-2xl">
                  <Shield className="w-6 h-6 text-white" />
                  <span className="text-2xl font-black text-white tracking-tight">
                    RIF: {cliente.rif}
                  </span>
                </div>
                <Deuda />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {/* Cliente Info */}
            <div className="lg:col-span-2 xl:col-span-2 group">
              <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-3xl p-10 lg:p-12 hover:border-white/20 transition-all duration-500 hover:shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <User2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Cliente
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full" />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group/item flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-x-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border-2 border-purple-500/30 flex-shrink-0 mt-1">
                      <User2 className="w-8 h-8 text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                          Nombre / Razón Social
                        </span>
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight group-hover/item:text-blue-100 transition-colors">
                        {cliente.descripcion || cliente.name}
                      </h2>
                    </div>
                  </div>

                  <div className="group/item flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-x-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border-2 border-blue-500/30 flex-shrink-0 mt-1">
                      <Mail className="w-8 h-8 text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                          Email
                        </span>
                      </div>
                      <div className="text-xl font-semibold text-blue-200 break-words hover:text-blue-100 transition-colors group-hover/item:underline">
                        {cliente.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🆕 NUEVA CARD: Límite de Crédito */}
            <div>
              <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-500/5 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-10 lg:p-12 h-fit shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-indigo-400/50 relative overflow-hidden">
                {/* Badge de loading */}
                {creditoLoading && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 border-2 border-indigo-400/50 border-t-indigo-400 rounded-full animate-spin" />
                  </div>
                )}

                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Línea de Crédito
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-transparent rounded-full" />
                  </div>
                </div>

                {credito ? (
                  <>
                    <div className="text-center">
                      <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-2xl mb-4">
                        ${credito.limite_credito?.toLocaleString() || "0"}
                      </div>
                      <div className="text-lg font-semibold text-indigo-200 uppercase tracking-wider mb-6">
                        Límite Disponible
                      </div>

                      {/* Estado del crédito */}
                      <div
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 ${
                          credito.estado_credito === "activo"
                            ? "bg-green-500/20 text-green-300 border border-green-500/40"
                            : credito.estado_credito === "pendiente"
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                              : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full ${
                            credito.estado_credito === "activo"
                              ? "bg-green-400"
                              : credito.estado_credito === "pendiente"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                          }`}
                        />
                        {credito.estado_credito?.toUpperCase() || "INACTIVO"}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-indigo-300">
                    <DollarSign className="w-24 h-24 mx-auto opacity-40 mb-6" />
                    <p className="text-xl font-semibold">Sin límite asignado</p>
                    <p className="text-indigo-400 mt-2">
                      El administrador aún no ha configurado tu línea de crédito
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Descuentos (sin cambios) */}
            <div>
              <div className="bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-500/5 backdrop-blur-xl border border-green-500/30 rounded-3xl p-10 lg:p-12 h-fit shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-green-400/50">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Percent className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Descuentos
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-transparent rounded-full" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-center group">
                    <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl mb-3">
                      {cliente.descuento1}%
                    </div>
                    <div className="text-lg font-semibold text-green-200 uppercase tracking-wider">
                      Descuento Comercial
                    </div>
                  </div>

                  <div className="text-center group">
                    <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl mb-3">
                      {cliente.descuento2}%
                    </div>
                    <div className="text-lg font-semibold text-green-200 uppercase tracking-wider">
                      Descuento Especial
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiración (sin cambios) */}
            {cliente.exp && (
              <div
                className={`col-span-full group ${isExpired ? "animate-pulse" : ""}`}
              >
                <div
                  className={`backdrop-blur-xl border-2 rounded-3xl p-10 lg:p-12 shadow-2xl transition-all duration-500 hover:shadow-3xl ${
                    isExpired
                      ? "bg-gradient-to-br from-red-500/30 via-red-600/20 to-red-500/10 border-red-500/50 hover:border-red-400/70"
                      : "bg-gradient-to-br from-yellow-500/30 via-orange-500/20 to-yellow-500/10 border-yellow-500/50 hover:border-yellow-400/70"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${
                        isExpired
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : "bg-gradient-to-r from-yellow-500 to-orange-500"
                      }`}
                    >
                      <CalendarClock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black mb-1 ${
                          isExpired ? "text-red-200" : "text-yellow-200"
                        }`}
                      >
                        Sesión Activa
                      </h3>
                      <div
                        className={`w-24 h-1 rounded-full ${
                          isExpired ? "bg-red-400/60" : "bg-yellow-400/60"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`text-4xl lg:text-5xl font-black text-center mb-4 ${
                      isExpired
                        ? "text-red-200 drop-shadow-lg"
                        : "text-yellow-200 drop-shadow-lg"
                    }`}
                  >
                    {isExpired ? "¡EXPIRADO!" : `${hoursLeft}h ${minutesLeft}m`}
                  </div>
                  <div
                    className={`text-xl font-semibold text-center uppercase tracking-wider ${
                      isExpired ? "text-red-300" : "text-yellow-300"
                    }`}
                  >
                    Tiempo restante
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default InfoClientePage;
