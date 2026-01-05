import { useAuth } from "@/hooks/useAuth";
import { usePedidosDeuda } from "@/hooks/useDeuda";
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
        if (selectedIds.size === pedidosPendientes.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(pedidosPendientes.map((p: Pedido) => p._id));
            setSelectedIds(allIds);
        }
    };

    // Efecto: Cada vez que cambia la selección, calculamos y notificamos al padre
    useEffect(() => {
        // Filtramos los objetos completos basados en los IDs seleccionados
        const facturasSeleccionadas = pedidosPendientes.filter((p: Pedido) =>
            selectedIds.has(p._id)
        );

        // Calculamos el total
        const totalPagar = facturasSeleccionadas.reduce(
            (acc: number, curr: Pedido) => acc + Number(curr.total),
            0
        );

        // Creamos el objeto resumen
        const resumen: ResumenSeleccion = {
            ids: Array.from(selectedIds),
            facturas: facturasSeleccionadas,
            totalPagar: totalPagar,
            cantidad: facturasSeleccionadas.length
        };

        // Enviamos al padre
        onSelectionChange(resumen);

    }, [selectedIds, pedidosPendientes]); // Se ejecuta cuando cambia la selección o la data

    // Formateador de moneda
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(amount);

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

    if (pedidosPendientes.length === 0) {
        return <div className="text-slate-400 text-center p-8">No tienes facturas pendientes.</div>;
    }

    const isAllSelected = pedidosPendientes.length > 0 && selectedIds.size === pedidosPendientes.length;


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
                    Seleccionar Todo ({pedidosPendientes.length})
                </Checkbox>
                <Chip size="sm" variant="flat" color="success">
                    {selectedIds.size} Seleccionadas
                </Chip>
            </div>
            {pedidosPendientes.map((pedido: Pedido) => {
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
                                        Factura #{pedido.numero_fac_a2}
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
                                {formatCurrency(Number(pedido.total))}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            })}
        </div>
    </div>;
};