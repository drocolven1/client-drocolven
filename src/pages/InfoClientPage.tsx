// src/components/InfoClientePage.tsx
import ClientLayout from "@/layouts/Client";
import React, { useState, useEffect } from "react";
import {
  User2,
  Mail,
  CalendarClock,
  Percent,
  Shield,
} from "lucide-react";

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
  const [cliente, setCliente] = useState<ClienteSeleccionado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      setLoading(false);
    } catch (err: any) {
      setError("Error al leer datos del almacenamiento local");
      console.error("Error parsing cliente-storage:", err);
      setLoading(false);
    }
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
              <div className="flex flex-col items-start lg:items-start">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/80 to-indigo-600/80 backdrop-blur-xl border border-blue-500/50 rounded-2xl mb-6 shadow-2xl">
                  <Shield className="w-6 h-6 text-white" />
                  <span className="text-2xl font-black text-white tracking-tight">
                    RIF: {cliente.rif}
                  </span>
                </div>
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

            {/* Descuentos */}
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
                      Descuento 1
                    </div>
                  </div>

                  <div className="text-center group">
                    <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl mb-3">
                      {cliente.descuento2}%
                    </div>
                    <div className="text-lg font-semibold text-green-200 uppercase tracking-wider">
                      Descuento 2
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiración */}
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
                    {isExpired ? "Tiempo restante" : "Tiempo restante"}
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
