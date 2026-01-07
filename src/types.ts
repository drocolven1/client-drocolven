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
export interface Tasa {
    _id: string;
    tasa: number; // O el nombre del campo que uses en tu DB (ej. "tasa_paralela")
    fecha_actualizacion?: string;
}

export interface Pedido {
  _id: string;
  fecha: string;
  total: number;
  estado: string;
  observacion?: string;
  productos?: ProductoPedido[];
  cliente: string;
  numero_fac_a2: string;
}
