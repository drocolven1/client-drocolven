import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import FacturasParaPagos, { ResumenSeleccion } from "./FacturasParaPagos";

export default function DrawerFactPagoSelect({ handleSeleccionFacturas }: { handleSeleccionFacturas: (resumen: ResumenSeleccion) => void }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <Button onPress={onOpen} color="primary">Seleccionar</Button>
            <Drawer isOpen={isOpen} onOpenChange={onOpenChange} backdrop="transparent" className="dark text-foreground bg-background">
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col gap-1">Facturas Pendientes por Pagar</DrawerHeader>
                            <DrawerBody>
                                <FacturasParaPagos onSelectionChange={handleSeleccionFacturas} />
                            </DrawerBody>
                            <DrawerFooter>
                                <Button color="primary" onPress={onClose}>
                                    Action
                                </Button>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}
