import { useAuth } from "@/hooks/useAuth";
import { usePedidosDeuda } from "@/hooks/useDeuda";
import { useTasa } from "@/hooks/useTasa";
import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Definimos la estructura de la factura basada en tu código
interface Pedido {
    _id: string;
    fecha: string;
    numero_fac_a2: string;
    total: number;
    // Agrega aquí otras propiedades si las tiene
}

// Definimos el objeto que devolveremos al padre
export interface ResumenSeleccion {
    ids: string[];          // IDs para enviar al backend
    facturas: Pedido[];     // Objetos completos por si se necesitan mostrar
    totalPagar: number;     // Suma total calculada
    cantidad: number;       // Cantidad de facturas
}

interface FacturasParaPagosProps {
    // Esta es la prop clave para comunicarnos con el padre
    onSelectionChange: (data: ResumenSeleccion) => void;
}

export default function FacturasParaPagos({ onSelectionChange }: FacturasParaPagosProps) {
    const { tasa } = useTasa()
    const { user } = useAuth();
    const {
        pedidos: pedidosPendientes,
        loading: loadingPendiente,
        error: errorPendiente,
    } = usePedidosDeuda({
        estadoDeuda: "activa",
        rifCliente: user?.rif ?? "",
        baseURL,
    });

    const pedidosFiltrados = pedidosPendientes.filter(
        (p: Pedido) => p.numero_fac_a2 && p.numero_fac_a2.trim() !== ""
    );

    // Estado para guardar los IDs de las facturas seleccionadas
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Función para manejar el check/uncheck
    const toggleFactura = (id: string) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Función para seleccionar/deseleccionar todas
    const toggleAll = () => {
        // Usamos pedidosFiltrados en lugar de pedidosPendientes
        if (selectedIds.size === pedidosFiltrados.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(pedidosFiltrados.map((p: Pedido) => p._id));
            setSelectedIds(allIds);
        }
    };
    // Efecto: Cada vez que cambia la selección, calculamos y notificamos al padre
    useEffect(() => {
        // Usamos pedidosFiltrados para el resumen
        const facturasSeleccionadas = pedidosFiltrados.filter((p: Pedido) =>
            selectedIds.has(p._id)
        );

        const totalPagar = facturasSeleccionadas.reduce(
            (acc: number, curr: Pedido) => acc + Number(curr.total),
            0
        );

        const resumen: ResumenSeleccion = {
            ids: Array.from(selectedIds),
            facturas: facturasSeleccionadas,
            totalPagar: totalPagar,
            cantidad: facturasSeleccionadas.length
        };

        onSelectionChange(resumen);
    }, [selectedIds, pedidosFiltrados]); // Escuchamos cambios en la lista filtrada

    if (loadingPendiente) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="rounded-2xl h-20 w-full bg-white/5" />
                ))}
            </div>
        );
    }

    if (errorPendiente) {
        return <div className="text-red-400 p-4 border border-red-500/20 rounded-xl">Error cargando facturas</div>;
    }

    if (pedidosFiltrados.length === 0) {
        return <div className="text-slate-400 text-center p-8">No tienes facturas válidas con número asignado.</div>;
    }

    const isAllSelected = pedidosFiltrados.length > 0 && selectedIds.size === pedidosFiltrados.length;

    return <div className="space-y-4">
        {/* Lista de Facturas */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <Checkbox
                    isSelected={isAllSelected}
                    onValueChange={toggleAll}
                    color="success"
                    classNames={{ label: "text-slate-300 text-sm" }}
                >
                    Seleccionar Todo ({pedidosFiltrados.length})
                </Checkbox>
                <Chip size="sm" variant="flat" color="success">
                    {selectedIds.size} Seleccionadas
                </Chip>
            </div>
            {pedidosFiltrados.map((pedido: Pedido) => {
                const isSelected = selectedIds.has(pedido._id);
                return <Card
                    key={pedido._id}
                    isPressable
                    onPress={() => toggleFactura(pedido._id)}
                    className={`border transition-all duration-200 ${isSelected
                        ? "bg-primary-500/10 border-primary-500/50"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                        }`}
                >
                    <CardBody className="flex flex-row items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-4">
                            <Checkbox
                                isSelected={isSelected}
                                color="success"
                                // Prevenimos que el click en el checkbox dispare doble evento si el card es pressable
                                onClick={(e) => e.stopPropagation()}
                                onValueChange={() => toggleFactura(pedido._id)}
                            />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className={`w-4 h-4 ${isSelected ? "text-primary-400" : "text-slate-400"}`} />
                                    <p className={`font-bold text-sm ${isSelected ? "text-white" : "text-slate-200"}`}>
                                        Fac #{pedido.numero_fac_a2}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {new Date(pedido.fecha).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">Monto</p>
                            <p className={`font-mono font-bold ${isSelected ? "text-primary-400" : "text-white"}`}>
                                Bs {(Number(pedido.total) * (tasa?.tasa || 0)).toFixed(4)}
                            </p>
                            <p className={`font-mono font-bold ${isSelected ? "text-primary-400" : "text-white"}`}>
                                $ {(Number(pedido.total)).toFixed(4)}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            })}
        </div>
    </div>;
};