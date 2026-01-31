import { Pedido } from "@/types";

export const clientPedidos = {
    async fetchPedidosByCliente(
        { rif }: { rif: string }
    ) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/pedidos/por_cliente/${rif}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Pedido[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching pedidos by cliente:", error);
            throw error;
        }
    }
}
