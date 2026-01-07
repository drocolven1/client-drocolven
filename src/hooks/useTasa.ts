import { useState, useEffect } from "react";
import { Tasa } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const useTasa = () => {
    const [tasa, setTasa] = useState<Tasa | null>(null);
    const [loadingTasa, setLoadingTasa] = useState(true);
    const [errorTasa, setErrorTasa] = useState("");

    const fetchTasa = async () => {
        try {
            setLoadingTasa(true);
            const response = await fetch(`${API_BASE}/tasa`);
            
            if (!response.ok) {
                throw new Error("No se pudo obtener la tasa");
            }

            const data = await response.json();
            setTasa(data);
            setErrorTasa("");
        } catch (err) {
            setErrorTasa(err instanceof Error ? err.message : "Error al cargar tasa");
        } finally {
            setLoadingTasa(false);
        }
    };

    useEffect(() => {
        fetchTasa();
    }, []);

    return { tasa, loadingTasa, errorTasa, refreshTasa: fetchTasa };
};