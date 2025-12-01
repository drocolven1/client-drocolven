export interface ProductoPayload {
  producto_codigo: string;
  cantidad: number;
}

export interface TransaccionPayload {
  tipo_movimiento: string;
  usuario: string;
  observaciones: string;
  documento_origen: string;
  productos: ProductoPayload[];
}

/**
 * @interface Cliente
 * @description Define la estructura de un objeto Cliente.
 */
export interface Cliente {
  rif: string;
  encargado: string;
  descuento1?: string | number; // Puede ser string si viene de input o number si es procesado
  descuento2?: string | number;
  // Añade aquí cualquier otra propiedad relevante de Cliente
}

/**
 * @interface Producto
 * @description Define la estructura de un objeto Producto disponible para la venta.
 */
export interface Producto {
  id: string;
  descripcion: string;
  precio: number;
  // Añade aquí cualquier otra propiedad relevante de Producto (ej. stock, categoria, imagen)
}

/**
 * @interface CarritoItem
 * @description Define la estructura de un item dentro del carrito de compras.
 */
export interface CarritoItem {
  id: string; // ID del producto
  cantidad: number;
  // Puedes añadir más detalles del producto aquí si no quieres buscarlo cada vez que renderices el carrito
  // Por ejemplo:
  // descripcion: string;
  // precioUnitario: number;
}

/**
 * @interface CarritoProducto
 * @description Producto con toda la información relevante para el carrito y resumen, incluyendo cantidades, descuentos y detalles extra.
 */
export interface CarritoProducto {
  codigo: string; // Antes era id
  descripcion: string;
  precio: number;
  precio_n?: number;
  descuento1: number;
  descuento2: number;
  descuento3: number;
  descuento4: number;
  existencia?: number;
  cantidad_pedida: number;
  dpto?: string;
  laboratorio?: string;
  nacional?: string;
  fv?: string;
}
