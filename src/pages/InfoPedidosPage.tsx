import { RangeCalendar } from "@heroui/calendar";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useState, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { getLocalTimeZone } from "@internationalized/date";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";

// Importar componentes de Heroui React para filtros
import {
  AlertCircle,
  ClipboardX,
  Loader2,
  PackagePlus,
  CheckCircle,
  Truck,
  List,
  Filter,
  RotateCcw,
  Sheet,
  CheckCheck,
  Search,
} from "lucide-react";

import { Pedido } from "@/types";
import { useAuth } from "@/components/hooks/useAuth";
import PedidoCard from "@/components/PedidoCard";
import ClientLayout from "@/layouts/Client";
import { Button } from "@heroui/button";

// Definición de los estados disponibles
const ESTADOS_PEDIDO = [
  { key: "all", label: "Todos los estados" },
  { key: "picking", label: "Picking" },
  { key: "Checkpicking", label: "CheckPicking" },
  { key: "packing", label: "Packing" },
  { key: "enviado", label: "Enviado" },
  { key: "entregado", label: "Entregado" },
  { key: "cancelado", label: "Cancelado" },
];

// Definición del tipo para el rango de fechas (usado por RangeCalendar)
interface DateRange {
  start: any; // Tipo CalendarDate o null
  end: any; // Tipo CalendarDate o null
}

// Valores iniciales para el rango de fechas
const initialDateRange: DateRange = { start: null, end: null };

// Componente funcional para el panel de filtros
const FiltroPedidos = ({
  setFilterStatus,
  filterDateRange,
  setFilterDateRange,
  resetFilters,
}: {
  filterStatus: string[];
  setFilterStatus: (status: string[]) => void;
  filterDateRange: DateRange;
  setFilterDateRange: (range: DateRange) => void;
  resetFilters: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [value, setValue] = useState<any>(new Set(["all"]));
  useEffect(() => {
    setFilterStatus([...value]);
  }, [value]);

  return (
    <div className="p-4 rounded-lg shadow-md mb-6 flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between animate-in fade-in duration-500">
      {/* Controles de Filtro */}
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <div className="flex flex-col w-full sm:w-60 gap-2">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-white mb-1 flex items-center"
          >
            <Filter className="h-4 w-4 mr-1 text-primary-500" />
            Filtrar por Estado
          </label>
          <Select
            label="selection"
            className="w-full"
            placeholder="Selecciona un estado"
            selectedKeys={value}
            onSelectionChange={setValue}
          >
            {ESTADOS_PEDIDO.map((estado) => (
              <SelectItem key={estado.key}>{estado.label}</SelectItem>
            ))}
          </Select>
        </div>

        {/* Filtro por Rango de Fecha (Usando RangeCalendar) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white mb-1 flex items-center">
            <List className="h-4 w-4 mr-1 text-primary-500" />
            Filtrar por Rango de Fecha
          </label>
          <Popover
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            backdrop="transparent"
            placement="bottom"
          >
            <PopoverTrigger>
              <Button color="primary" size="lg">
                Seleccionar rango
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <RangeCalendar
                aria-label="Rango de Fechas de Pedido"
                value={
                  filterDateRange.start && filterDateRange.end
                    ? filterDateRange
                    : null
                } // Controlado
                onChange={setFilterDateRange}
                visibleMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Botón para Resetear Filtros */}
      <Button
        onPress={() => {
          resetFilters(), setValue(["all"]);
        }}
        className="w-full sm:w-auto mt-4 lg:mt-0"
        color="primary"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Resetear Filtros
      </Button>
    </div>
  );
};

export function InfoPedidoPage() {
  const { user, isAuthenticated } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // **Nuevos estados para los filtros**
  const [filterStatus, setFilterStatus] = useState(["all"]);
  const [filterDateRange, setFilterDateRange] =
    useState<DateRange>(initialDateRange);

  // Función para resetear los filtros
  const resetFilters = () => {
    setFilterStatus(["all"]);

    setFilterDateRange(initialDateRange);
  };

  // Lógica de carga (fetch) - Se mantiene igual
  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user || !isAuthenticated) {
        setError("Debes iniciar sesión para ver tus pedidos.");
        setLoading(false);
        return;
      }

      if (!user.rif || typeof user.rif !== "string" || user.rif.trim() === "") {
        setError(
          "No se encontró un RIF válido en tu perfil. Por favor, revisa tus datos o contacta soporte."
        );
        setLoading(false);
        return;
      }

      setError("");
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/pedidos/por_cliente/${user.rif}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          let errorMessage =
            "No se pudieron cargar los pedidos. Intenta nuevamente.";

          if (response.status === 404) {
            errorMessage = "No se encontraron pedidos para tu RIF.";
          } else if (errorData.detail) {
            errorMessage = `Error: ${errorData.detail}`;
          } else {
            errorMessage = `Error del servidor: ${response.status}`;
          }

          throw new Error(errorMessage);
        }

        const data: Pedido[] = await response.json();
        if (Array.isArray(data)) {
          setPedidos(data);
        } else {
          throw new Error("Respuesta inesperada del servidor.");
        }
      } catch (err: any) {
        const errorMessage =
          err.message || "Error desconocido al cargar pedidos.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [isAuthenticated, user]);
  // Fin de la lógica de carga

  // **Lógica para filtrar los pedidos (usando useMemo)**
  const filteredPedidos = useMemo(() => {
    let currentPedidos = pedidos;
    console.log(pedidos);
    // 1. Filtrar por Estado
    if (filterStatus[0] !== "all") {
      currentPedidos = currentPedidos.filter((pedido) =>
        filterStatus.includes(pedido.estado)
      );
    }

    // 2. Filtrar por Rango de Fecha (Si hay start y end)
    const { start, end } = filterDateRange;

    if (start && end) {
      const startDay = start.toDate(getLocalTimeZone()).getTime();
      const endDay = end.toDate(getLocalTimeZone()).getTime();

      currentPedidos = currentPedidos.filter((pedido) => {
        // Asume que la fecha del pedido es 'YYYY-MM-DD HH:mm:ss'
        const [datePart] = pedido.fecha.split(" ");

        // Convertir la fecha del pedido a un objeto Date (en la zona horaria local)
        const pedidoDate = new Date(datePart);

        // Comprobar si la fecha del pedido cae dentro del rango [start, end]
        // Incluimos el inicio y el fin del rango.
        return (
          pedidoDate.getTime() >= startDay && pedidoDate.getTime() <= endDay
        );
      });
    }

    return currentPedidos;
  }, [pedidos, filterStatus, filterDateRange]);

  if (!isAuthenticated) {
    // ... (El estado de No Autenticado se mantiene igual)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-sm text-center p-6 shadow-lg border-red-200 bg-red-50 animate-in fade-in zoom-in-95 duration-500">
          <CardBody>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl text-red-700">Acceso Denegado</h2>
            <p className="text-red-600">
              Debes iniciar sesión para ver tus pedidos.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Comprobar si hay resultados después de aplicar los filtros
  const hasOrders = pedidos.length > 0;
  const hasFilteredResults = filteredPedidos.length > 0;

  return (
    <ClientLayout>
      <div className="w-full max-h-screen overflow-auto">
        <div className="w-full py-6 px-2 sm:px-4 md:px-6 lg:px-8 min-h-screen flex flex-col">
          <h1 className="text-2xl font-bold text-white mb-4 sm:mb-6">
            Historial de Pedidos
          </h1>

          {/* Renderizado de los filtros si hay pedidos cargados */}
          {!loading && hasOrders && (
            <FiltroPedidos
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterDateRange={filterDateRange}
              setFilterDateRange={setFilterDateRange}
              resetFilters={resetFilters}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 text-lg">
              <Loader2 className="animate-spin h-12 w-12 text-primary-500 mb-4" />
              <p className="text-base md:text-lg">Cargando tus pedidos...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && !hasOrders && (
            <Card className="w-full max-w-md mx-auto text-center p-4 sm:p-6 shadow-lg border-red-200 bg-red-50 animate-in fade-in zoom-in-95 duration-500">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl text-red-700">
                ¡Ups, un problema!
              </h2>
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {/* No Orders State (si no hay pedidos en total) */}
          {!loading && !error && !hasOrders && (
            <Card className="w-full max-w-md mx-auto text-center p-4 sm:p-6 shadow-lg border-dashed border-2 border-gray-300 bg-white animate-in fade-in zoom-in-95 duration-500">
              <ClipboardX className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-700">
                No tienes pedidos registrados.
              </h2>
              <p className="text-gray-500">
                Cuando realices tu primer pedido, aparecerá aquí.
              </p>
            </Card>
          )}

          {/* No Filtered Results State */}
          {!loading && !error && hasOrders && !hasFilteredResults && (
            <Card className="w-full max-w-md mx-auto text-center p-4 sm:p-6 shadow-lg border-dashed border-2 border-primary-300 bg-primary-50 animate-in fade-in zoom-in-95 duration-500">
              <Filter className="h-12 w-12 sm:h-16 sm:w-16 text-primary-500 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-2xl font-semibold text-primary-700">
                Sin resultados de búsqueda.
              </h2>
              <p className="text-primary-600">
                Ningún pedido coincide con el estado o rango de fecha
                seleccionado.
              </p>
            </Card>
          )}

          {/* Orders List */}
          {!loading && !error && hasFilteredResults && (
            <div className="space-y-4 ml-14 sm:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {[...filteredPedidos].reverse().map((pedido) => {
                // Definir los pasos reales del trayecto del pedido
                const steps = [
                  {
                    key: "picking",
                    label: "Picking",
                    icon: <Search className="h-5 w-5 sm:h-6 sm:w-6" />,
                  },
                  {
                    key: "checkpicking",
                    label: "CheckPicking",
                    icon: <CheckCheck className="h-5 w-5 sm:h-6 sm:w-6" />,
                  },
                  {
                    key: "packing",
                    label: "Packing",
                    icon: <PackagePlus className="h-5 w-5 sm:h-6 sm:w-6" />,
                  },
                  {
                    key: "para_facturar",
                    label: "Facturacion",
                    icon: <Sheet className="h-5 w-5 sm:h-6 sm:w-6" />,
                  },
                  {
                    key: "enviado",
                    label: "Enviado",
                    icon: <Truck className="h-5 w-5 sm:h-6 sm:w-6" />,
                  },
                  {
                    key: "entregado",
                    label: "Entregado",
                    icon: <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
                  },
                ];
                const currentStep = steps.findIndex(
                  (s) => s.key === pedido.estado
                );

                return (
                  <PedidoCard
                    key={pedido._id}
                    pedido={pedido}
                    steps={steps}
                    currentStep={currentStep}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
