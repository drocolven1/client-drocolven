import { useCarritoStore } from "../store/carrito.storage";

export const useCarrito = () => {
  return {
    carrito: useCarritoStore(s => s.carrito),
    agregarProducto: useCarritoStore(s => s.agregar),
    quitarProducto: useCarritoStore(s => s.quitar),
    actualizarCantidad: useCarritoStore(s => s.actualizarCantidad),
    eliminarProducto: useCarritoStore(s => s.eliminar),
    limpiarCarrito: useCarritoStore(s => s.limpiar),

    total: useCarritoStore(s => s.total),
  };
};
