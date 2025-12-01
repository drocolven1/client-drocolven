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

interface ProductosState {
  productos: Producto[];
  loading: boolean;
  error: string | null;

  fetchProductos: (preciosmp: boolean) => Promise<void>;
}

export const useProductosStore = create<ProductosState>((set: any) => ({
  productos: [],
  loading: false,
  error: null,

  fetchProductos: async (preciosmp: boolean = false) => {
    try {
      set({ loading: true, error: null });

      const baseURL = import.meta.env.VITE_API_URL;
      const inventarioURL = `${baseURL}/inventario_maestro`;
      const conveniosURL = `${baseURL}/convenios`;

      const [inventarioRes, conveniosRes] = await Promise.all([
        fetch(inventarioURL),
        preciosmp ? fetch(conveniosURL) : Promise.resolve(null),
      ]);

      if (!inventarioRes.ok) throw new Error("Error cargando inventario");

      const inventarioJson = await inventarioRes.json();
      const inventario: ItemInventario[] =
        inventarioJson.inventario_maestro ?? [];

      // Procesar convenios
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

      set({ productos: formateados });
    } catch (error) {
      console.error(error);
      set({ productos: [], error: "Error cargando productos" });
    } finally {
      set({ loading: false });
    }
  },
}));
