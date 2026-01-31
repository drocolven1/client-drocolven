import { useState } from "react";
import { clientReclamos, ReclamoPayload } from "@/services/reclamos.service";

export const useReclamos = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any | null>(null);

  const fetchReclamosByCliente = async (rif: string) => {
    try {
      setLoading(true);
      const res = await clientReclamos.fetchReclamosByCliente(rif);
      setData(res);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerReclamo = async (payload: ReclamoPayload) => {
    try {
      setLoading(true);
      const res = await clientReclamos.registerReclamo(payload);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    data,
    error,
    fetchReclamosByCliente,
    registerReclamo,
  } as const;
};
