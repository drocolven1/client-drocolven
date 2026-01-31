export type ReclamoPayload = {
  rif: string;
  numero_factura: string;
  tipo: string;
  descripcion: string;
  email?: string;
  fecha?: string;
};

export const clientReclamos = {
  async registerReclamo(payload: ReclamoPayload) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reclamos/cliente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error registering reclamo:", error);
      throw error;
    }
  },

  async fetchReclamosByCliente(rif: string) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reclamos/cliente/${rif}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error fetching reclamos by cliente:", error);
      throw error;
    }
  },
};
