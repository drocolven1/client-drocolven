import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Smartphone, CreditCard, Copy, Info, CheckCircle2, CopyPlus } from "lucide-react";
import { useClienteStore } from "@/components/carritoCliente/store/cliente.storage";
import DrawerFactPagoSelect from "./DrawerFactPagoSelect";
import { ResumenSeleccion } from "./FacturasParaPagos";
import { useTasa } from "@/hooks/useTasa";

interface BancoReceptor {
  _id: string;
  nombre: string;
  tipo: "transferencia" | "pagomovil" | "ambos";
  documento: string;
  numero_cuenta?: string;
  numero_telefono?: string;
  estado: "activo" | "inactivo" | "suspendido";
}
const endpoint = "/pagos/procesar";

export default function FormularioPago() {
  const [metodo, setMetodo] = useState<string | number>("movil");
  const [loading, setLoading] = useState<boolean>(false);
  const [bancosReceptores, setBancosReceptores] = useState<BancoReceptor[]>([]);
  const [bancosActivos, setBancosActivos] = useState<BancoReceptor[]>([]);
  const [fetchingBancos, setFetchingBancos] = useState<boolean>(true);
  const clienteSeleccionado = useClienteStore((s) => s.clienteSeleccionado);
  const [datosFacturas, setDatosFacturas] = useState<ResumenSeleccion | null>(null);
  const { tasa } = useTasa();
  const handleSeleccionFacturas = (resumen: ResumenSeleccion) => {
    setDatosFacturas(resumen);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    const bancoSeleccionado = bancosActivos.find(
      (b) => b._id === rawData.banco_receptor_id
    );

    const dataToSend = {
      identificacion: rawData.identificacion,
      referencia: rawData.referencia,
      facturasSeleccionadas: datosFacturas?.facturas,
      totalFacturas: datosFacturas?.totalPagar,
      datos_origen: metodo === "movil" ? rawData.numero_telefono : rawData.numero_cuenta,
      metodo: metodo === "movil" ? "pagomovil" : "transferencia",
      banco_receptor: bancoSeleccionado?.nombre || "",
      banco_receptor_documento: bancoSeleccionado?.documento || "",
      rif_cliente: clienteSeleccionado ? clienteSeleccionado.rif : "",
      nombre_cliente: clienteSeleccionado ? clienteSeleccionado.descripcion : "",
      monto_pagado: rawData.monto_pagado || 0,
    };

    console.log("Datos a enviar:", dataToSend);


    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        alert("Pago reportado exitosamente");
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail || "No se pudo procesar"}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const copiarDato = (dato: string) => {
    navigator.clipboard.writeText(dato);
  };

  useEffect(() => {
    const cargarBancos = async () => {
      try {
        const response = await fetch("http://localhost:8000/bancos");
        if (!response.ok) throw new Error("Error en la petición");
        const data = await response.json();
        const normalized = data.filter(
          (b: BancoReceptor) => b.estado === "activo"
        );
        setBancosReceptores(normalized);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingBancos(false);
      }
    };
    cargarBancos();
  }, []);

  useEffect(() => {
    const filtrados = bancosReceptores.filter((b) =>
      metodo === "movil"
        ? b.tipo === "pagomovil" || b.tipo === "ambos"
        : b.tipo === "transferencia" || b.tipo === "ambos"
    );
    setBancosActivos(filtrados);
  }, [metodo, bancosReceptores]);

  return (
    <div className="relative max-w-6xl mx-auto px-2 py-3 lg:py-3 overflow-hidden">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary-400 font-bold tracking-widest text-xs uppercase mb-2">
            <span className="w-8 h-[2px] bg-primary-500" />
            Sistema de Pagos
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-3">
          <Info className="text-primary-400 w-5 h-5" />
          <p className="text-xs text-slate-400 max-w-[200px]">
            Asegúrate de que los datos coincidan con tu comprobante.
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA: CUENTAS (4 COLUMNAS) */}
        <aside className="lg:col-span-5 space-y-6 order-2 lg:order-1">
          {/* ... Sidebar bancos sin cambios ... */}
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-inner">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" />
                Cuentas Destino
              </h2>
              <Chip
                variant="dot"
                color="success"
                className="border-none text-primary-400 font-bold"
              >
                {bancosActivos.length} Disponibles
              </Chip>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {fetchingBancos
                ? Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-32 w-full bg-white/5 rounded-3xl animate-pulse"
                    />
                  ))
                : bancosActivos.map((banco) => (
                  <div
                    key={banco._id}
                    className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-primary-500/30 rounded-[2rem] p-5 transition-all duration-300"
                  >
                    {/* Contenido banco sin cambios */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-center text-white group-hover:text-primary-400 transition-colors">
                        {banco.nombre.toUpperCase()}
                      </h3>
                    </div>
                    <div className="grid gap-2">
                      {(banco.tipo === "transferencia" || banco.tipo === "ambos") && banco.numero_cuenta && (
                        <div className="flex flex-col items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5 hover:bg-black/60 transition-all group/item">
                          <div className="flex items-center justify-between w-full min-w-0 cursor-pointer" onClick={() => copiarDato(banco.numero_cuenta!)}>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">N° Cuenta</p>
                              <p className="font-mono text-sm text-slate-200 truncate">{banco.numero_cuenta}</p>
                            </div>
                            <Copy className="text-slate-600 hover:text-primary-400" size={16} />
                          </div>
                          <div className="flex items-center justify-between w-full min-w-0 cursor-pointer" onClick={() => copiarDato(banco.documento)}>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">RIF</p>
                              <p className="font-mono text-sm text-slate-200 truncate">{banco.documento}</p>
                            </div>
                            <Copy className="text-slate-600 hover:text-primary-400" size={16} />
                          </div>
                        </div>
                      )}
                      {(banco.tipo === "pagomovil" || banco.tipo === "ambos") && banco.numero_telefono && (
                        <div className="flex flex-col items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5 hover:bg-black/60 transition-all group/item">
                          <div className="flex items-center justify-between w-full min-w-0 cursor-pointer" onClick={() => copiarDato(banco.numero_telefono!)}>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Teléfono</p>
                              <p className="font-mono text-sm text-slate-200 truncate">{banco.numero_telefono}</p>
                            </div>
                            <Copy className="text-slate-600 hover:text-primary-400" size={16} />
                          </div>
                          <div className="flex items-center justify-between w-full min-w-0 cursor-pointer" onClick={() => copiarDato(banco.documento)}>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">RIF</p>
                              <p className="font-mono text-sm text-slate-200 truncate">{banco.documento}</p>
                            </div>
                            <Copy className="text-slate-600 hover:text-primary-400" size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        {/* COLUMNA DERECHA: FORMULARIO MEJORADO (7 COLUMNAS) */}
        <main className="lg:col-span-7 order-1 lg:order-2">
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary-500/10 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Reportar Pago
                </h2>
                <Chip color="primary" variant="flat" className="font-bold text-white">
                  {datosFacturas ? `${datosFacturas.cantidad} facturas` : "Sin selección"}
                </Chip>
              </div>
              <Tabs
                selectedKey={metodo}
                onSelectionChange={setMetodo}
                variant="underlined"
                classNames={{
                  tabList: "gap-8 border-b border-white/5 w-full",
                  cursor: "w-full bg-primary-500 h-1 rounded-full",
                  tabContent: "group-data-[selected=true]:text-primary-400 font-bold text-lg",
                }}
              >
                <Tab key="movil" title={<><Smartphone className="w-5 h-5 inline mr-2" />Pago Móvil</>} />
                <Tab key="transferencia" title={<><CreditCard className="w-5 h-5 inline mr-2" />Transferencia</>} />
              </Tabs>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* SECCIÓN 1: DATOS BANCARIOS - 2x2 GRID */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 block mb-2">
                    Identificación del titular de la cuenta
                  </label>
                  <Input
                    name="identificacion"
                    isRequired
                    placeholder="V-12345678"
                    variant="bordered"
                    color="success"
                    classNames={{
                      inputWrapper: "h-14 rounded-2xl border-white/20 bg-white/5 backdrop-blur-sm group-hover:border-primary-400 transition-all",
                      input: "text-white placeholder-slate-400",
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 block mb-2">
                    {metodo === "movil" ? "Teléfono Origen" : "N° Cuenta Origen"}
                  </label>
                  <Input
                    name={metodo === "movil" ? "numero_telefono" : "numero_cuenta"}
                    isRequired
                    placeholder={metodo === "movil" ? "0412-1234567" : "0123-4567-89-0123456789"}
                    variant="bordered"
                    color="success"
                    classNames={{
                      inputWrapper: "h-14 rounded-2xl border-white/20 bg-white/5 backdrop-blur-sm group-hover:border-primary-400 transition-all",
                      input: "text-white placeholder-slate-400 font-mono",
                    }}
                  />
                </div>
              </div>

              {/* SECCIÓN 2: REFERENCIA - FULL WIDTH */}
              <div className="space-y-3 grid md:grid-cols-2 gap-6">
                <div>

                  <label className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    Número de Referencia <Chip size="sm" color="warning">Obligatorio</Chip>
                  </label>
                  <Input
                    name="referencia"
                    isRequired
                    placeholder="numero de referencia completo"
                    description="Copia desde tu comprobante bancario"
                    variant="bordered"
                    color="warning"
                    classNames={{
                      inputWrapper: "h-14 rounded-2xl border-warning/30 bg-warning/5 backdrop-blur-sm",
                      input: "text-white placeholder-slate-400 font-mono tracking-wider",
                      description: "text-slate-400 text-sm mt-1",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    Monto de Pago <Chip size="sm" color="warning">Obligatorio</Chip>
                  </label>
                  <Input
                    name="monto_pagado"
                    isRequired
                    placeholder="monto exacto pagado"
                    description="Monto exacto pagado segun comprobante"
                    variant="bordered"
                    color="warning"
                    classNames={{
                      inputWrapper: "h-14 rounded-2xl border-warning/30 bg-warning/5 backdrop-blur-sm",
                      input: "text-white placeholder-slate-400 font-mono tracking-wider",
                      description: "text-slate-400 text-sm mt-1",
                    }}
                  />
                </div>
              </div>

              {/* SECCIÓN 3: BANCO DESTINO + FACTURAS - 2x2 GRID */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300 block mb-3">
                    Banco Destino
                  </label>
                  <Select
                    name="banco_receptor_id"
                    isRequired
                    placeholder="Selecciona banco"
                    variant="bordered"
                    color="success"
                    classNames={{
                      listbox: " [&_[data-selected=true]]:text-green-600",
                      trigger: "h-14 rounded-2xl border-white/10 text-black",
                      label: "text-slate-900 font-semibold mb-2",
                      description: "text-black",
                      value: "text-white",
                    }}
                    className="dark"
                  >
                    {bancosActivos.map((banco) => (
                      <SelectItem key={banco._id} textValue={banco.nombre}>
                        <div className="flex items-center gap-3 p-2">
                          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                            <span className="font-bold text-primary text-sm">
                              {banco.nombre.substring(0, 3)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-black">{banco.nombre.toUpperCase()}</p>
                            <p className="text-xs text-slate-800 capitalize">{banco.tipo}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="w-full">
                  <label className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    Facturas <Chip size="sm" color="primary">{datosFacturas?.cantidad || 0}</Chip>
                  </label>
                  <div className="flex items-center justify-center gap-4 text-xl w-full">
                    <DrawerFactPagoSelect handleSeleccionFacturas={handleSeleccionFacturas} />
                    {datosFacturas && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Monto</p>
                        <p className="font-mono font-bold text-white">
                          Bs {(Number(datosFacturas.totalPagar) * (tasa?.tasa || 0)).toFixed(4)}
                        </p>
                        <p className="font-mono font-bold text-white">
                          $ {(Number(datosFacturas.totalPagar)).toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: BOTÓN PRINCIPAL */}
              <div className="pt-6">
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full h-16 rounded-3xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-black text-xl shadow-2xl hover:shadow-primary/25 transition-all duration-300 border-2 border-transparent hover:border-primary-400/50"
                  isLoading={loading}
                  startContent={!loading && <CheckCircle2 size={24} />}
                  endContent={!loading && <CopyPlus size={24} />}
                >
                  {loading ? "⏳ PROCESANDO..." : "🚀 REPORTAR PAGO"}
                </Button>
                <p className="text-center text-slate-500 text-xs mt-4 leading-relaxed">
                  Tu pago será verificado automáticamente en minutos.
                  <br />
                  <span className="text-primary-400 font-semibold">¡Recibirás confirmación por WhatsApp!</span>
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
