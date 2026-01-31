import { clientPedidos } from "@/services/pedidos.service"
import { useState } from "react"


export const usePedido = ({ rif }: { rif: string }) => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any[]>([])
    const listPedidosByCliente = async () => {
        try {
            setLoading(true)
            const data = await clientPedidos.fetchPedidosByCliente({ rif })
            setData(data)
            return data
        } catch (error) {
            console.error("Error in usePedidos - listPedidosByCliente:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return { loading, listPedidosByCliente, data }
}