import { useState } from "react";
import { Download, FileWarning, AlertCircle } from "lucide-react";
import { Button } from "@heroui/button";

interface Props {
  numeroFactura?: string | null;
}

export default function BotonDescargarFactura({ numeroFactura }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDescargar = async () => {
    if (!numeroFactura) return;

    setLoading(true);
    setError(false);
    
    try {
      // 1. Pedir URL firmada al backend
      const response = await fetch(`http://localhost:5000/facturas/ver/${numeroFactura}.pdf`);
      
      if (!response.ok) throw new Error("No encontrado");

      const data = await response.json();
      
      // 2. Crear un link temporal y simular click para descargar
      const link = document.createElement("a");
      link.href = data.presigned_url;
      link.target = "_blank";
      // El nombre de descarga lo maneja el Content-Disposition del backend
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Error al descargar:", err);
      setError(true);
      // Resetear el error después de 3 segundos para permitir reintento
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // CASO 1: No hay número de factura (Prop nula o vacía)
  if (!numeroFactura) {
    return (
      <Button disabled variant="flat" color="default" startContent={<FileWarning size={18} />}>
        Factura no disponible
      </Button>
    );
  }

  // CASO 2: Error en la búsqueda (Archivo no encontrado en R2)
  if (error) {
    return (
      <Button color="danger" variant="flat" onPress={handleDescargar} startContent={<AlertCircle size={18} />}>
        Error al obtener archivo
      </Button>
    );
  }

  // CASO 3: Estado Normal / Cargando
  return (
    <Button
      color="primary"
      variant="solid"
      isLoading={loading}
      onPress={handleDescargar}
      startContent={!loading && <Download size={18} />}
    >
      {loading ? "Preparando..." : "Descargar Factura"}
    </Button>
  );
}