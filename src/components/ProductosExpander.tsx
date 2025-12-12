import { Button } from "@heroui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import ProductosPedidoList from "./ProductosPedidoList"; // Ajusta la ruta
import { Pedido } from "@/types";

const ProductosExpander = ({ pedido }: { pedido: Pedido }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 sm:mt-5 bg-gradient-to-r from-gray-50 to-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-gray-100/50 shadow-sm w-full">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between h-auto py-3 px-4 sm:px-6 text-left hover:bg-primary/5 group font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2 text-primary-700 group-hover:text-primary-800 w-full">
          📦 Ver productos ({pedido.productos?.length || 0})
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 shrink-0" />
        )}
      </Button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200/70 bg-white/50 rounded-lg overflow-hidden">
          <ProductosPedidoList productos={pedido.productos ?? []} />
        </div>
      )}
    </div>
  );
};

export default ProductosExpander;
