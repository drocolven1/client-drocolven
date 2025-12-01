// src/hooks/useClientes.ts
import { useEffect, useState } from "react";
import { ClienteDetalle, ClienteResumen, useClienteStore } from "../store/cliente.storage";


export const useCliente = () => {
  const { clientes, setClientes, setClienteSeleccionado } = useClienteStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch listado de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/clientes`);
        const json = await res.json();

        const resumen: ClienteResumen[] = json.map((c: any) => ({
          id: c._id?.$oid || c._id,
          email: c.email || "",
          rif: c.rif || "",
          encargado: c.encargado || "",
        }));

        setClientes(resumen);
      } catch (err) {
        console.error(err);
        setError("Error al obtener lista de clientes");
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [setClientes]);

  // Seleccionar cliente
  const seleccionarCliente = async (rif: string) => {
    if (!rif) {
      setClienteSeleccionado(null);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/clientes/${rif}`
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      if (!data || data.error)
        throw new Error(data?.error || "Cliente no encontrado");

      const detalle: ClienteDetalle = {
        id: data._id || "",
        email: data.email || "",
        rif: data.rif || "",
        encargado: data.encargado || "",
        direccion: data.direccion || "",
        telefono: data.telefono || "",
        activo: data.activo || false,
        descuento1:
          Number(data.descuento1?.$numberDouble ?? data.descuento1) || 0,
        descuento2:
          Number(data.descuento2?.$numberDouble ?? data.descuento2) || 0,
        descuento3:
          Number(data.descuento3?.$numberDouble ?? data.descuento3) || 0,
        preciosmp: data.preciosmp || false,
      };

      setClienteSeleccionado(detalle);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Error al obtener cliente");
      setClienteSeleccionado(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    clientes,
    seleccionarCliente,
    loading,
    error,
    clienteSeleccionado: useClienteStore((s: any) => s.clienteSeleccionado),
  };
};
