import { useState, useEffect, useCallback, useMemo } from 'react';

interface PedidoDeuda {
  _id: string;
  total: number;
  fecha: string;
  id_cliente: string;
}

interface UsePedidosDeudaProps {
  estadoDeuda: string;
  rifCliente: string;
  baseURL?: string;
}

interface UsePedidosDeudaReturn {
  pedidos: PedidoDeuda[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalDeuda: number;
}

export function usePedidosDeuda({ 
  estadoDeuda, 
  rifCliente, 
  baseURL = import.meta.env.VITE_API_URL 
}: UsePedidosDeudaProps): UsePedidosDeudaReturn {
  const [pedidos, setPedidos] = useState<PedidoDeuda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    if (!estadoDeuda || !rifCliente) {
      setPedidos([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${baseURL}/pedidos/estado_deuda/${estadoDeuda}/cliente/${rifCliente}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PedidoDeuda[] = await response.json();
      setPedidos(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setPedidos([]);
      console.error('Error fetching pedidos:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [estadoDeuda, rifCliente, baseURL]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const refetch = useCallback(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // 🆕 Cálculo del total de deudas
  const totalDeuda = useMemo(() => {
    return pedidos.reduce((suma, pedido) => suma + pedido.total, 0);
  }, [pedidos]);

  return {
    pedidos,
    loading,
    error,
    refetch,
    totalDeuda,  // 🆕 Nuevo valor
  };
}
