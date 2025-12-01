import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CarritoProducto } from "../types/types";

interface CarritoState {
  carrito: CarritoProducto[];

  agregar: (producto: CarritoProducto, cantidad?: number) => void;
  quitar: (codigo: string) => void;
  actualizarCantidad: (codigo: string, cantidad: number) => void;
  eliminar: (codigo: string) => void;
  limpiar: () => void;

  total: number;
}

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set, get) => ({
      carrito: [],

      agregar: (producto, cantidad = 1) => {
        set((state) => {
          const index = state.carrito.findIndex(
            (p) => p.codigo === producto.codigo
          );

          if (index !== -1) {
            const updated = [...state.carrito];
            const prev = updated[index];

            const nuevaCantidad = Math.min(prev.cantidad_pedida + cantidad);

            updated[index] = { ...prev, cantidad_pedida: nuevaCantidad };

            return { carrito: updated };
          }

          return {
            carrito: [
              ...state.carrito,
              { ...producto, cantidad_pedida: cantidad },
            ],
          };
        });
      },

      quitar: (codigo) => {
        set((state) => ({
          carrito: state.carrito
            .map((p) =>
              p.codigo === codigo
                ? { ...p, cantidad_pedida: p.cantidad_pedida - 1 }
                : p
            )
            .filter((p) => p.cantidad_pedida > 0),
        }));
      },

      actualizarCantidad: (codigo, cantidad) => {
        set((state) => ({
          carrito: state.carrito.map((p) =>
            p.codigo === codigo ? { ...p, cantidad_pedida: cantidad } : p
          ),
        }));
      },

      eliminar: (codigo) =>
        set((state) => ({
          carrito: state.carrito.filter((p) => p.codigo !== codigo),
        })),

      limpiar: () => set({ carrito: [] }),

      // selector: total calculado automáticamente
      get total() {
        return get().carrito.reduce((acc, p) => {
          const precio = p.precio_n ?? p.precio;
          return acc + precio * p.cantidad_pedida;
        }, 0);
      },
    }),
    { name: "carrito" }
  )
);
