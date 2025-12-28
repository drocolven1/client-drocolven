// CarritoClientePage.tsx

import { useState, useMemo } from "react";
import { useProductos } from "@/components/carritoCliente/hooks/useProducts";
import { useCarrito } from "@/components/carritoCliente/hooks/useCarrito";
import { useClienteStore } from "@/components/carritoCliente/store/cliente.storage";

import { ResumenCarrito } from "@/components/carritoCliente/ui/ResumenCarrito";
import { ProductList } from "@/components/carritoCliente/ui/ProductList";
import { Buscador } from "@/components/carritoCliente/ui/Buscador";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";

import { filtrarPorMultiplesPalabrasAND } from "@/components/carritoCliente/utils/filter";
import ClientLayout from "@/layouts/Client";
import { Deuda } from "@/components/Deuda";
import { CreditDisplay } from "@/components/Credito";

export function CarritoClientePage() {
  // -------------------------
  // Cliente
  // -------------------------
  const clienteSeleccionado = useClienteStore((s) => s.clienteSeleccionado);
  // -------------------------
  // Productos (ya no hay paginación)
  // -------------------------
  const { productos, loading, error } = useProductos();

  // -------------------------
  // Carrito
  // -------------------------
  const { carrito } = useCarrito();

  // -------------------------
  // Búsqueda
  // -------------------------
  const [busqueda, setBusqueda] = useState("");

  // -------------------------
  // Filtrado (local)
  // -------------------------
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
  // Estados tempranos
  // -------------------------
  if (!clienteSeleccionado)
    return (
      <ClientLayout>
        <div className="p-4 text-center text-red-600">
          Error: Cliente no cargado
        </div>
      </ClientLayout>
    );

  if (loading)
    return (
      <ClientLayout>
        <div className="p-4 text-center text-gray-600">
          Cargando productos...
        </div>
      </ClientLayout>
    );

  if (error)
    return (
      <ClientLayout>
        <div className="p-4 text-center text-red-600">
          Error cargando productos: {error}
        </div>
      </ClientLayout>
    );

  // -------------------------
  // Render principal
  // -------------------------
  return (
    <ClientLayout>
      <div className="page-container flex flex-col gap-4 p-4">
        {/* Botón de Logout/Cerrar Sesión 🚪
        <div className="flex justify-end mb-4">
        <Button
        color="danger"
        variant="flat"
        size="sm"
        onPress={handleLogout}
          >
          Cerrar Sesión
          </Button>
          </div> */}
        <div className="flex flex-row items-center justify-end h-16 gap-2 m-4 animate__animated animate__fadeInLeft">
          <div>
            <Deuda fila={true} />
          </div>
          <CreditDisplay rif={clienteSeleccionado.rif} />
        </div>
        {/* Búsqueda */}
        <Buscador busqueda={busqueda} setBusqueda={setBusqueda} />

        {/* Lista de productos */}
        <ProductList
          productos={productosFiltrados}
          descuentoCliente1={clienteSeleccionado.descuento1}
          descuentoCliente2={clienteSeleccionado.descuento2}
          loading={loading}
        />

        {/* Modal Carrito */}
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          backdrop="blur"
          size="5xl"
        >
          <ModalContent className="h-[85%]">
            <ModalHeader className="justify-center">
              <p>Resumen del Carrito</p>
            </ModalHeader>
            <ModalBody className="overflow-y-auto">
              <ResumenCarrito cliente={clienteSeleccionado} />
            </ModalBody>
            <ModalFooter></ModalFooter>
          </ModalContent>
        </Modal>

        {/* Botón flotante */}
        <Button
          radius="full"
          color="primary"
          className="fixed bottom-6 right-6 shadow-2xl px-6 py-3 font-semibold text-lg hover:scale-[1.03]"
          onPress={onOpen}
        >
          Ver Carrito ({carrito.length})
        </Button>
      </div>
    </ClientLayout>
  );
}
