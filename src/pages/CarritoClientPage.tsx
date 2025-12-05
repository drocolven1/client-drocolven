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
  // Función de Logout 🚀
  // -------------------------
  const handleLogout = () => {
    // 1. Borrar todo el localStorage
    localStorage.clear();
    // 2. Recargar la ventana
    window.location.reload();
  };

  // -------------------------
  // Estados tempranos
  // -------------------------
  if (!clienteSeleccionado)
    return (
      <div className="p-4 text-center text-red-600">
        Error: Cliente no cargado
      </div>
    );

  if (loading)
    return (
      <div className="p-4 text-center text-gray-600">Cargando productos...</div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        Error cargando productos: {error}
      </div>
    );

  // -------------------------
  // Render principal
  // -------------------------
  return (
    <div className="page-container flex flex-col gap-4 p-4 bg-gray-50 min-h-screen">
      {/* Botón de Logout/Cerrar Sesión 🚪 */}
      <div className="flex justify-end mb-4">
        <Button color="danger" variant="flat" size="sm" onPress={handleLogout}>
          Cerrar Sesión
        </Button>
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
      <Modal isOpen={isOpen} size="full" onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <p>Resumen del Carrito</p>
          </ModalHeader>
          <ModalBody className="overflow-auto">
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
  );
}
