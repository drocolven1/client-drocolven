import { useAuth } from "@/hooks/useAuth";
import { usePedidosDeuda } from "@/hooks/useDeuda";
import { Button } from "@heroui/button";

export function Deuda() {
  const { user } = useAuth();
  const { pedidos, loading, error, refetch, totalDeuda } = usePedidosDeuda({
    estadoDeuda: "pendiente",
    rifCliente: user?.rif ?? "",
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  });

  if (loading) return <div>Cargando pedidos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-row text-white items-center font-bold bg-linear-to-l from-primary-400/50 to-primary-600/50 px-2 rounded-2xl">
      <Button onPress={refetch} color="primary">
        Recargar
      </Button>
      <div className="p-4">
        <div>PEDIDOS PENDIENTES: {pedidos.length}</div>
        <p>DEUDA: ${totalDeuda.toLocaleString()}</p>
      </div>
    </div>
  );
}
