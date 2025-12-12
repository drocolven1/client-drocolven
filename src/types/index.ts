import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface ProductoPedido {
  id: string;
  descripcion: string;
  cantidad_pedida: number;
  precio: number;
  descuento1?: number;
  descuento2?: number;
  descuento3?: number;
  descuento4?: number;
}

export interface Pedido {
  _id: string;
  fecha: string;
  total: number;
  estado: string;
  observacion?: string;
  productos?: ProductoPedido[];
  cliente: string;
}