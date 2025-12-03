// src/hooks/useClientes.ts
import { useEffect, useState, useCallback } from "react";
import {
  ClienteDetalle,
  ClienteResumen,
  useClienteStore,
} from "../store/cliente.storage";
import { useAuth } from "@/components/hooks/useAuth";

// Función de mapeo (utilidad) para limpiar el hook
const mapToClienteDetalle = (data: any): ClienteDetalle => ({
  id: data._id?.$oid || data._id || "",
  descripcion:data.descripcion || "",
  email: data.email || "",
  rif: data.rif || "",
  encargado: data.encargado || "",
  direccion: data.direccion || "",
  telefono: data.telefono || "",
  activo: data.activo || false,
  // Aseguramos la conversión numérica, manejando $numberDouble
  descuento1: Number(data.descuento1?.$numberDouble ?? data.descuento1) || 0,
  descuento2: Number(data.descuento2?.$numberDouble ?? data.descuento2) || 0,
  descuento3: Number(data.descuento3?.$numberDouble ?? data.descuento3) || 0,
  preciosmp: data.preciosmp || false,
});

export const useCliente = () => {
  // -------------------------
  // 🎣 Hooks de Datos
  // -------------------------
  const { token } = useAuth(); // 👈 Obtenemos el token del AuthContext
  const { clientes, setClientes, setClienteSeleccionado } = useClienteStore();
  const clienteSeleccionado = useClienteStore((s) => s.clienteSeleccionado);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // 📞 Funciones de Fetch con Autorización (Reutilizables)
  // -------------------------
  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  // Fetch listado de clientes
  useEffect(() => {
    // No intentes hacer fetch si no hay token (usuario no logueado)
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchClientes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/clientes`);

        if (!res.ok) throw new Error(`Error ${res.status} al obtener clientes`);

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
  }, [setClientes, token, getAuthHeaders]); // 👈 Dependencias añadidas

  // Seleccionar cliente
  const seleccionarCliente = async (rif: string) => {
    if (!rif) {
      setClienteSeleccionado(null);
      return;
    }

    // No intentes hacer fetch si no hay token
    if (!token) {
      setError("No autorizado para seleccionar cliente");
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

      // 🚀 Usamos la utilidad de mapeo
      const detalle = mapToClienteDetalle(data);

      setClienteSeleccionado(detalle);
      return detalle; // Opcional: retornar el detalle
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Error al obtener cliente");
      setClienteSeleccionado(null);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // 📢 Exportación
  // -------------------------
  return {
    clientes,
    seleccionarCliente,
    loading,
    error,
    clienteSeleccionado, // Usamos el hook de Zustand de forma limpia aquí
    // Nota: si tienes un store global, es mejor exportar el clienteSeleccionado
    // directamente del store en los componentes que lo usan para evitar re-renders innecesarios.
  };
};
