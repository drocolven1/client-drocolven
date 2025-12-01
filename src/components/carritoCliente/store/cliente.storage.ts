// src/store/clienteStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ClienteResumen {
  id: string;
  email: string;
  rif: string;
  encargado: string;
}

export interface ClienteDetalle extends ClienteResumen {
  direccion: string;
  telefono: string;
  activo: boolean;
  descuento1: number;
  descuento2: number;
  descuento3: number;
  preciosmp: boolean;
}

interface ClienteState {
  clientes: ClienteResumen[];
  clienteSeleccionado: ClienteDetalle | null;

  setClientes: (data: ClienteResumen[]) => void;
  setClienteSeleccionado: (c: ClienteDetalle | null) => void;
  limpiarCliente: () => void;
}

export const useClienteStore = create<ClienteState>()(
  persist(
    (set) => ({
      clientes: [],
      clienteSeleccionado: null,

      setClientes: (data) => set({ clientes: data }),
      setClienteSeleccionado: (c) => set({ clienteSeleccionado: c }),
      limpiarCliente: () => set({ clienteSeleccionado: null }),
    }),
    {
      name: "cliente-storage", // localStorage key
    }
  )
);
