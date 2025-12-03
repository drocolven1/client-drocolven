// src/components/carritoCliente/store/productos.store.ts

import { create } from "zustand";

export interface Producto {
  codigo: string;
  descripcion: string;
  precio: number;
  cantidad_pedida: number;
  cantidad_encontrada: number;
  existencia: number;
  descuento1: number;
  descuento2: number;
  descuento3: number;
  descuento4: number;
}

interface ItemInventario {
  codigo: string;
  descripcion: string;
  precio: number | string;
  cantidad: number | string;
  existencia: number;
  descuento1: number | string;
  descuento2: number | string;
  descuento3: number | string;
  descuento4: number | string;
}

interface Convenio {
  _id: string;
  estado: string;
  productos: Record<string, number>;
}

// Suponemos que la respuesta paginada del backend tiene esta forma
interface InventarioPaginatedResponse {
    inventario_maestro: ItemInventario[];
    total_pages: number;
    current_page: number;
    // Otros campos que tu backend de FastAPI pudiera devolver
}

// 🚀 Nuevos campos en el estado para el Infinite Scroll
interface ProductosState {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  currentPage: number; // Página actual cargada (0 al inicio)
  hasMore: boolean;     // Indica si hay más páginas por cargar (true al inicio)

  // 🎯 La acción ahora acepta página y límite
  fetchProductos: (page: number, limit: number, preciosmp: boolean) => Promise<void>;
  resetProductos: () => void; // Para reiniciar el estado
}

// 🎯 El nuevo endpoint de paginación
const INVENTARIO_PAGINADO_URL = `${import.meta.env.VITE_API_URL}/inventario/paginated/`;
const CONVENIOS_URL = `${import.meta.env.VITE_API_URL}/convenios/`;


export const useProductosStore = create<ProductosState>((set: any, get: any) => ({
  productos: [],
  loading: false,
  error: null,
  currentPage: 0, 
  hasMore: true,

  resetProductos: () => set({ 
      productos: [], 
      currentPage: 0, 
      hasMore: true,
      loading: false,
      error: null
  }),

  fetchProductos: async (page: number, limit: number, preciosmp: boolean = false) => {
    // Guardias: Si ya estamos cargando o no hay más páginas (a menos que sea la Pág 1)
    if (get().loading || (!get().hasMore && page !== 1)) return;
    
    try {
      set({ loading: true, error: null });

      // 🎯 Modificación CRÍTICA: Llamar a la API con parámetros de paginación
      const inventarioURL = `${INVENTARIO_PAGINADO_URL}?page=${page}&limit=${limit}`;

      const [inventarioRes, conveniosRes] = await Promise.all([
        fetch(inventarioURL),
        preciosmp ? fetch(CONVENIOS_URL) : Promise.resolve(null),
      ]);

      if (!inventarioRes.ok) throw new Error("Error cargando inventario paginado");

      const inventarioPaginatedJson: InventarioPaginatedResponse = await inventarioRes.json();
      const inventario: ItemInventario[] = inventarioPaginatedJson.inventario_maestro ?? [];
      const totalPages = inventarioPaginatedJson.total_pages;

      // Procesar convenios (sin cambios)
      let preciosConvenio: Record<string, number> = {};
      if (conveniosRes && conveniosRes.ok) {
        const convenios: Convenio[] = await conveniosRes.json();
        preciosConvenio = convenios
          .filter((c) => c.estado === "activo")
          .reduce(
            (acc, c) => ({ ...acc, ...c.productos }),
            {} as Record<string, number>
          );
      }

      // Mapeo y limpieza de datos (sin cambios)
      const formateados: Producto[] = inventario
        .filter((i) => i.existencia > 0)
        .map((i) => ({
          codigo: i.codigo,
          descripcion: i.descripcion.trim(),
          precio: preciosConvenio[i.codigo] || Number(i.precio) || 0,
          cantidad_pedida: 0,
          cantidad_encontrada: 0,
          existencia: i.existencia,
          descuento1: Number(i.descuento1) || 0,
          descuento2: Number(i.descuento2) || 0,
          descuento3: Number(i.descuento3) || 0,
          descuento4: Number(i.descuento4) || 0,
        }));
        
      // 🚀 CONCATENACIÓN DE RESULTADOS: Mantiene los productos existentes y añade los nuevos
      const currentProducts = get().productos;

      set({ 
          productos: [...currentProducts, ...formateados], 
          currentPage: page,
          hasMore: page < totalPages, 
      });
      
    } catch (error) {
      console.error(error);
      set({ error: "Error cargando productos", hasMore: false }); 
    } finally {
      set({ loading: false });
    }
  },
}));