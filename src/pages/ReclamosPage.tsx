import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import ClientLayout from "@/layouts/Client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePedido } from "@/hooks/usePedidos";
import type { Pedido as PedidoType } from "@/types";
import ReclamoSelect from "@/components/ReclamoSelect";
import FacturaSelect from "@/components/FacturaSelect";
import { useReclamos } from "@/hooks/useReclamos";

export default function ReclamosPage() {
    const { user } = useAuth();
    const { listPedidosByCliente, data } = usePedido({ rif: user?.rif ?? "" });
    const [selectedNumero, setSelectedNumero] = useState<string>("");

    useEffect(() => {
        if (user?.rif) {
            listPedidosByCliente().catch((e) => console.error(e));
        }
    }, [user?.rif]);

    const uniqueNumeros = useMemo(() => {
        if (!data) return [] as string[];
        return Array.from(new Set(data.map((p: any) => p.numero_fac_a2))).filter(Boolean) as string[];
    }, [data]);

    const selectedPedido = useMemo(() => {
        return (data || []).find((p: any) => p.numero_fac_a2 === selectedNumero) as PedidoType | undefined;
    }, [data, selectedNumero]);
    const [selectedTipo, setSelectedTipo] = useState<string>("");
    const [descripcion, setDescripcion] = useState<string>("");
    const [email, setEmail] = useState<string>(user?.email ?? "");

    const { registerReclamo, loading: reclamosLoading } = useReclamos();

    useEffect(() => {
        setEmail(user?.email ?? "");
    }, [user?.email]);

    const handleSubmit = async () => {
        if (!user?.rif) {
            alert("Usuario no autenticado");
            return;
        }
        if (!selectedNumero) {
            alert("Selecciona un pedido antes de enviar el reclamo");
            return;
        }
        if (!selectedTipo) {
            alert("Selecciona el tipo de reclamo");
            return;
        }

        const payload = {
            rif: user.rif,
            numero_factura: selectedNumero,
            tipo: selectedTipo,
            descripcion,
            email,
        };

        try {
            await registerReclamo(payload as any);
            alert("Reclamo enviado correctamente");
            setDescripcion("");
            setSelectedTipo("");
            setSelectedNumero("");
        } catch (err) {
            console.error(err);
            alert("Error al enviar el reclamo");
        }
    };

    return (
        <ClientLayout>
            <div className="px-4 py-8 max-h-screen overflow-auto">
                {/* Contenedor principal con efecto glass */}
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-primary-400">Reclamo de pedido</h1>
                        <p className="mt-2 text-sm text-white/80">
                            Completa el formulario para reportar un problema con tu pedido.
                        </p>
                    </div>

                    {/* Pedido info: selector dinámico y detalles */}
                    <Card className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-lg">
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-white">Datos del pedido</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <FacturaSelect
                                        label="Seleccionar pedido"
                                        items={uniqueNumeros}
                                        value={selectedNumero}
                                        onChange={(n) => setSelectedNumero(n)}
                                        placeholder="Filtrar por número de factura..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 text-white/90">
                                    <div>
                                        <p className="text-sm font-medium text-white/70">Número de pedido</p>
                                        <p className="mt-1 font-medium">{selectedPedido ? selectedPedido.numero_fac_a2 : "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/70">Fecha</p>
                                        <p className="mt-1 font-medium">{selectedPedido ? selectedPedido.fecha : "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/70">Cliente</p>
                                        <p className="mt-1 font-medium">{selectedPedido ? selectedPedido.cliente : user?.name ?? "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/70">Estado</p>
                                        <span className="inline-block rounded-full bg-primary-300 px-3 py-1 text-sm font-medium text-white">
                                            {selectedPedido ? selectedPedido.estado : "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Formulario de reclamo */}
                    <Card className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-lg">
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-primary-400">Detalles del reclamo</h2>
                        </CardHeader>
                        <CardBody className="text-white/90">
                            <div className="space-y-8 text-white">
                                <ReclamoSelect
                                    label="Tipo de reclamo"
                                    items={["Producto dañado", "Producto faltante", "Error en el pedido", "Otro"]}
                                    value={selectedTipo}
                                    onChange={(v) => setSelectedTipo(v)}
                                    placeholder="Selecciona un tipo"
                                />

                                <Textarea
                                    label="Descripción del problema"
                                    placeholder="Describe con detalle lo que ocurrió..."
                                    minRows={4}
                                    value={descripcion}
                                    onChange={(e: any) => setDescripcion(e.target.value)}
                                    className="bg-transparent text-white placeholder:text-white/50"
                                    labelPlacement="outside"
                                    classNames={{ innerWrapper: "bg-transparent " }}
                                />
                            </div>
                        </CardBody>
                        <Divider className="my-4 bg-white/10" />
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="bordered" color="default" className="border-white/20 text-white" onClick={() => {
                                setDescripcion("");
                                setSelectedTipo("");
                                setSelectedNumero("");
                            }}>
                                Cancelar
                            </Button>
                            <Button
                                color="primary"
                                className="bg-primary-400 text-white hover:bg-primary-500"
                                onClick={handleSubmit}
                                disabled={reclamosLoading}
                            >
                                {reclamosLoading ? "Enviando..." : "Enviar reclamo"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Footer ayuda */}
                    <div className="mt-8 text-center text-sm text-white/70">
                        ¿Tienes dudas?{" "}
                        <Link color="primary" href="/ayuda" className="text-primary-300 hover:text-primary-200">
                            Contacta a soporte
                        </Link>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
