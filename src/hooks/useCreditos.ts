import { useState, useCallback } from "react";

// --- Tipos ---
export interface Cliente {
  _id: string; // Puede no estar presente en algunas respuestas de API
  rif: string;
  email: string; // Asumo que este campo sigue siendo necesario en la interfaz
  descripcion: string; // 🆕 Añadido al tipo Cliente
  limite_credito: number;
  estado_credito: string;
}

// --- Constantes ---
const API_BASE = import.meta.env.VITE_API_URL;

// 📦 Hook Principal (Solo API y Datos)
export function useCreditManager() {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Funciones de Utilidad Internas ---

  const updateLocalClient = useCallback(
    (rif: string, updates: Partial<Cliente>) => {
      setClientes((prev) =>
        prev.map((c) => (c.rif === rif ? { ...c, ...updates } : c))
      );
    },
    []
  );

  // --- Peticiones a la API ---

  // 1. Cargar Clientes (Fetch GET /clientes/creditos/all)
  const cargarClientes = useCallback(async (): Promise<Cliente[] | null> => {
    setError(null);
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/clientes/creditos/all`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      const data: Cliente[] = await response.json();
      const processedData: Cliente[] = data.map((cliente: any) => ({
        _id: cliente._id || "",
        rif: cliente.rif || "",
        email: cliente.email || "", // Aseguramos el email para la tabla principal
        descripcion: cliente.descripcion || "Sin descripcion",
        limite_credito: Number(cliente.limite_credito) || 0,
        estado_credito: cliente.estado_credito
          ? cliente.estado_credito.toLowerCase()
          : "inactivo",
      }));

      setClientes(processedData);
      return processedData;
    } catch (error: unknown) {
      const mensajeError =
        error instanceof Error ? error.message : "Error desconocido al cargar.";
      console.error("❌ Error cargando clientes:", error);
      setError(mensajeError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. 🆕 Obtener Cliente por RIF (Fetch GET /clientes/{rif}/credito)
  /**
   * Obtiene los datos de crédito de un solo cliente.
   * NO actualiza el estado 'clientes' de la tabla, solo devuelve el resultado.
   * @param rif El RIF del cliente.
   * @returns Los datos del cliente o null si no se encuentra.
   */
  const getClienteByRif = useCallback(
    async (rif: string): Promise<Cliente | null> => {
      setError(null);
      // Usamos un loading temporal si es necesario, pero es mejor que el componente llamador lo controle
      // setLoading(true);

      try {
        const response = await fetch(`${API_BASE}/clientes/${rif}/credito`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 404) {
          return null; // Cliente no encontrado
        }
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Error ${response.status}`);
        }

        // El endpoint devuelve {rif, limite_credito, estado_credito, descripcion}
        const data: any = await response.json();

        // Mapeamos los datos al tipo Cliente (asumiendo rif, limite_credito, estado_credito, descripcion son devueltos)
        // Nota: El email y el _id no se obtienen directamente de este endpoint, pero son requeridos por la interfaz Cliente.
        // Aquí devolvemos lo que tenemos, y el consumidor del hook deberá saber que faltan email/_id.
        // const limite_credito = ()=> if (data)

        const clienteData: Cliente = {
          _id: "", // Se deja vacío, ya que el endpoint no lo devuelve
          email: "", // Se deja vacío
          rif: data.rif,
          limite_credito:
            data.estado_credito === "activo"
              ? Number(data.limite_credito)
              : Number(data.limite_credito_pendiente) || 0,
          estado_credito: (data.estado_credito || "inactivo").toLowerCase(),
          descripcion: data.descripcion || "Sin Descripcion",
        };

        return clienteData;
      } catch (error: unknown) {
        const mensajeError =
          error instanceof Error
            ? error.message
            : "Error desconocido al buscar cliente.";
        console.error(`❌ Error buscando cliente ${rif}:`, error);
        setError(mensajeError);
        return null;
      } finally {
        // setLoading(false);
      }
    },
    []
  );

  // 3. Actualizar Límite de Crédito (Fetch PATCH /clientes/{rif}/credito)
  const actualizarLimite = useCallback(
    async (rif: string, nuevoLimite: number) => {
      console.log("🔄 PATCH límite:", rif, nuevoLimite); // 🆕 DEBUG

      try {
        const response = await fetch(`${API_BASE}/clientes/${rif}/credito`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limite_credito: nuevoLimite }),
        });

        console.log("📡 Response status:", response.status); // 🆕 DEBUG
        console.log("📡 Response ok:", response.ok); // 🆕 DEBUG

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ ERROR completo:", errorText); // 🆕 DEBUG
          throw new Error("Error al actualizar límite");
        }

        return true;
      } catch (error) {
        console.error("❌ CATCH completo:", error); // 🆕 DEBUG
        return false;
      }
    },
    []
  );

  const actualizarLimitePendiente = useCallback(
    async (rif: string, nuevoLimite: number) => {
      console.log("🔄 PATCH límite:", rif, nuevoLimite); // 🆕 DEBUG

      try {
        const response = await fetch(
          `${API_BASE}/clientes/${rif}/credito/pendiente`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ limite_credito: nuevoLimite }),
          }
        );

        console.log("📡 Response status:", response.status); // 🆕 DEBUG
        console.log("📡 Response ok:", response.ok); // 🆕 DEBUG

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ ERROR completo:", errorText); // 🆕 DEBUG
          throw new Error("Error al actualizar límite");
        }

        return true;
      } catch (error) {
        console.error("❌ CATCH completo:", error); // 🆕 DEBUG
        return false;
      }
    },
    []
  );

  // 4. Actualizar Estado de Crédito (Fetch PATCH /clientes/{rif}/credito/estado)
  const actualizarEstado = useCallback(
    async (rif: string, nuevoEstado: string): Promise<boolean> => {
      // ... (Lógica sin cambios)
      try {
        const response = await fetch(
          `${API_BASE}/clientes/${rif}/credito/estado`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado_credito: nuevoEstado }),
          }
        );

        if (!response.ok) throw new Error("Error al actualizar estado");

        updateLocalClient(rif, { estado_credito: nuevoEstado });
        return true;
      } catch (error) {
        console.error("❌ Error actualizando estado:", error);
        setError("Fallo al cambiar el estado.");
        return false;
      }
    },
    [updateLocalClient]
  );

  return {
    // Datos (Lectura)
    clientes,
    loading,
    error,

    // Funciones de API (Escritura/Lectura)
    cargarClientes,
    getClienteByRif, // 🆕 Nueva función
    actualizarLimite,
    actualizarLimitePendiente,
    actualizarEstado,

    // Utilidad
    updateLocalClient,
  };
}

export type UseCreditManager = ReturnType<typeof useCreditManager>;
