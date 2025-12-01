// CarritoClientePage.tsx

import { useState, useMemo, useEffect } from "react";
import { useProductos } from "@/components/carritoCliente/hooks/useProducts";
import { useCarrito } from "@/components/carritoCliente/hooks/useCarrito";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";

import { useClienteStore } from "@/components/carritoCliente/store/cliente.storage";
import { ResumenCarrito } from "@/components/carritoCliente/ui/ResumenCarrito";
import { ProductList } from "@/components/carritoCliente/ui/ProductList";

export function CarritoClientePage() {
  // -------------------------
  // Utilidad: filtro inteligente por múltiples palabras
  // -------------------------
  function filtrarPorMultiplesPalabrasAND<T>(
    data: T[],
    textoBusqueda: string,
    campos: (keyof T)[]
  ): T[] {
    const palabras = textoBusqueda.toLowerCase().split(" ").filter(Boolean);

    return data.filter((item) =>
      palabras.every((palabra) =>
        campos.some((campo) =>
          String(item[campo]).toLowerCase().includes(palabra)
        )
      )
    );
  }

  // -------------------------
  // Cliente persistido en Zustand
  // -------------------------
  const clienteSeleccionado = useClienteStore((s) => s.clienteSeleccionado);
  const setCliente = useClienteStore((s) => s.setClienteSeleccionado);

  // -------------------------
  // Productos
  // -------------------------
  const { productos, loading } = useProductos(
    clienteSeleccionado?.preciosmp ?? false
  );

  // -------------------------
  // Carrito
  // -------------------------
  const { carrito } = useCarrito();

  // -------------------------
  // Búsqueda
  // -------------------------
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = useMemo(
    () =>
      filtrarPorMultiplesPalabrasAND(productos, busqueda, [
        "descripcion",
        "codigo",
      ]),
    [productos, busqueda]
  );

  // -------------------------
  // Modal carrito
  // -------------------------
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // -------------------------
  // Mock de cliente (si no viene uno)
  // -------------------------
  useEffect(() => {
    // Evita sobrescribir si ya existe uno persistido
    if (clienteSeleccionado) return;

    setCliente({
      id: "123",
      rif: "J-12345678-9",
      email: "cliente@mail.com",
      encargado: "Juan Pérez",
      descuento1: 5,
      descuento2: 10,
      descuento3: 0,
      preciosmp: false,
      direccion: "Av Principal",
      telefono: "0412-0000000",
      activo: true,
    });
  }, []);

  if (!clienteSeleccionado) return <div>Cliente no cargado</div>;

  return (
    <div className="page-container flex flex-col gap-4 p-4 bg-gray-50 min-h-screen">

      {/* Barra de búsqueda simple */}
      <input
        type="text"
        placeholder="Buscar producto..."
        className="w-full p-3 rounded-xl border bg-white shadow-sm"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Lista */}
      <ProductList
        productos={productosFiltrados}
        descuentoCliente1={clienteSeleccionado.descuento1}
        descuentoCliente2={clienteSeleccionado.descuento2}
      />

      {/* Modal Resumen */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Resumen del Carrito</ModalHeader>

              <ModalBody>
                <ResumenCarrito cliente={clienteSeleccionado} />
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary">Procesar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Botón flotante simple */}
      <Button
        radius="full"
        color="primary"
        className="fixed bottom-6 right-6 shadow-xl px-6 py-3"
        onPress={onOpen}
      >
        Ver Carrito ({carrito.length})
      </Button>
    </div>
  );
}
