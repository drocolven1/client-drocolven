import React from 'react';

interface BuscadorProps {
    busqueda: string;
    setBusqueda: (value: string) => void;
}

export const Buscador: React.FC<BuscadorProps> = ({ busqueda, setBusqueda }) => (
    <div className="sticky top-0 z-10 p-1">
        <input
            type="text"
            placeholder="🔍 Buscar producto por descripción o código..."
            className="w-full p-3 rounded-xl border bg-white shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
        />
    </div>
);