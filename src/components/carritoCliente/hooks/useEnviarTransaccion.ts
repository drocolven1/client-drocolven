import { useState, useCallback } from "react";
import { TransaccionPayload } from "../types/types";

interface TransaccionResponse {
  ok: boolean;
  message: string;
  transaccion_id?: string | number;
  [key: string]: any;
}

/**
 * Hook para enviar transacciones con manejo de:
 * - loading
 * - error
 * - data devuelta por la API
 */
export const useEnviarTransaccion = () => {
  const [data, setData] = useState<TransaccionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviarTransaccionAPI = async (payload: TransaccionPayload) => {
    const apiUrl = `${import.meta.env.VITE_API_URL}/transaccion/transaccion`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || result.error || "Ocurrió un error en el servidor."
        );
      }

      return result;
    } catch (error) {
      // Relanza el error para que sea capturado por quien llame a esta función (el hook).
      throw error;
    }
  };

  const ejecutar = useCallback(
    async (payload: TransaccionPayload): Promise<TransaccionResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await enviarTransaccionAPI(payload);

        if (!response) {
          throw new Error("Respuesta vacía del servidor.");
        }

        if (!response.ok) {
          throw new Error(
            response.message || "No se pudo completar la transacción."
          );
        }

        setData(response);
        return response;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error inesperado al enviar transacción.";

        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { ejecutar, data, isLoading, error };
};
