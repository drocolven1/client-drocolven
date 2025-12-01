import React, { useState, useMemo } from "react";

interface Producto {
    codigo: string;
    descripcion: string;
    precio: number;
    precio_n?: number;
    descuento1: number;
    descuento2: number;
    descuento3: number;
    descuento4: number;
    cantidad_pedida: number;
    existencia: number;
    dpto?: string;
    laboratorio?: string;
    nacional?: string;
    fv?: string;
}

interface ProductoItemProps {
    producto: Producto;
    onAgregar: (producto: Producto, cantidad: number) => void;
    descuentoCliente1: number;
    descuentoCliente2: number;
}

export const ProductItem: React.FC<ProductoItemProps> = ({
    producto,
    onAgregar,
    descuentoCliente1,
    descuentoCliente2,
}) => {
    const [cantidadPedida, setCantidadPedida] = useState<string | number>("");
    const [showDescuentos, setShowDescuentos] = useState(false); // Estado para mostrar/ocultar descuentos en mobile

    const precioNetoFinal = useMemo(() => {
        let precioCalculado = producto.precio;

        precioCalculado *= (1 - producto.descuento1 / 100);
        precioCalculado *= (1 - producto.descuento2 / 100);
        // Si descuento3 y descuento4 del producto del producto son aplicables, actívalos aquí.
        // precioCalculado *= (1 - producto.descuento3 / 100);
        // precioCalculado *= (1 - producto.descuento4 / 100);

        precioCalculado *= (1 - descuentoCliente1 / 100);
        precioCalculado *= (1 - descuentoCliente2 / 100);

        // Aseguramos que el resultado siempre sea un número, y si no, devolvemos 0
        return isNaN(precioCalculado) ? 0 : parseFloat(precioCalculado.toFixed(2));
    }, [
        producto.precio,
        producto.descuento1,
        producto.descuento2,
        descuentoCliente1,
        descuentoCliente2,
    ]);

    const handleAgregar = () => {
        const cantidadValida = Number(cantidadPedida);

        if (isNaN(cantidadValida) || cantidadValida <= 0) {
            alert("Por favor, introduce una cantidad válida.");
            return;
        }

        onAgregar(
            {
                ...producto,
                precio_n: precioNetoFinal,
                cantidad_pedida: cantidadValida,
                descuento3: descuentoCliente1, // Guardar descuento del cliente
                descuento4: descuentoCliente2, // Guardar descuento del cliente
            },
            cantidadValida
        );
        setCantidadPedida(1); // Restablece la cantidad a 1 después de agregar
    };

    const isAddButtonDisabled = cantidadPedida === "" || producto.existencia === 0;

    return (
        <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-2xl shadow-lg p-4 sm:p-6 gap-4 border border-gray-100 hover:shadow-xl hover:bg-gray-200 w-full mx-auto">
            {/* Espacio reservado para imagen del producto */}
            <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-4xl mb-2 sm:mb-0 mr-0 sm:mr-4 border border-dashed border-gray-200">
                {/* Próximamente imagen */}
                <span className="text-xs text-gray-400">Imagen</span>
            </div>
            {/* Descripción y detalles */}
            <div className="flex-1 flex flex-col gap-3 text-center sm:text-left">
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-1">
                        {producto.descripcion}
                    </h3>
                {/* Stock y metadata */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-lg text-gray-600 mt-2">
                    {/* Eliminado: Stock y código */}
                    {producto.dpto && <span className="flex items-center gap-1"><span className="font-semibold">Dpto:</span> {producto.dpto}</span>}
                    {producto.laboratorio && <span className="flex items-center gap-1"><span className="font-semibold">Lab:</span> {producto.laboratorio}</span>}
                    {producto.nacional && <span className="flex items-center gap-1"><span className="font-semibold">Nacional:</span> {producto.nacional}</span>}
                    {producto.fv && <span className="flex items-center gap-1"> {producto.fv}</span>}
                </div>
                </div>

                {/* Descuentos y precio (visible en pantallas grandes) */}
                <div className="hidden sm:flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600 font-medium">
                        Base: <span className="font-bold text-gray-800">${producto.precio.toFixed(2)}</span>
                    </span>
                    {producto.descuento1 > 0 && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            DL: {producto.descuento1.toFixed(2)}%
                        </span>
                    )}
                    {producto.descuento2 > 0 && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            DE: {producto.descuento2.toFixed(2)}%
                        </span>
                    )}
                    {descuentoCliente1 > 0 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            DC: {descuentoCliente1.toFixed(2)}%
                        </span>
                    )}
                    {descuentoCliente2 > 0 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            PP: {descuentoCliente2.toFixed(2)}%
                        </span>
                    )}
                    <span className="text-base sm:text-lg font-bold text-blue-700 ml-auto flex items-center">
                        <span className="text-gray-500 mr-1 text-sm font-normal">Precio Final:</span> ${precioNetoFinal}
                    </span>
                </div>

                {/* Mobile: toggle de descuentos y precio */}
                <div className="sm:hidden flex flex-col items-center gap-2 mt-2">
                    <div className="text-sm text-gray-600 font-medium">
                        Base: <span className="font-bold text-gray-800">${producto.precio.toFixed(2)}</span>
                    </div>
                    <button
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors duration-200"
                        onClick={() => setShowDescuentos(!showDescuentos)}
                        aria-expanded={showDescuentos}
                        aria-controls="descuentos-mobile"
                    >
                        {showDescuentos ? "Ocultar descuentos" : "Ver descuentos"}
                    </button>
                    {showDescuentos && (
                        <div id="descuentos-mobile" className="flex flex-wrap justify-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg animate-fade-in-down">
                            {producto.descuento1 > 0 && <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">DL: {producto.descuento1.toFixed(2)}%</span>}
                            {producto.descuento2 > 0 && <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">DE: {producto.descuento2.toFixed(2)}%</span>}
                            {descuentoCliente1 > 0 && <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">DC: {descuentoCliente1.toFixed(2)}%</span>}
                            {descuentoCliente2 > 0 && <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">PP: {descuentoCliente2.toFixed(2)}%</span>}
                        </div>
                    )}
                    <span className="text-base font-bold text-blue-700 mt-2 flex items-center">
                        <span className="text-gray-500 mr-1 text-sm font-normal">Final:</span> ${precioNetoFinal}
                    </span>
                </div>

            </div>

            {/* Cantidad y botón de agregar */}
            <div className="flex flex-col justify-end items-center sm:items-end w-full sm:w-auto sm:min-w-[150px] gap-3 mt-4 sm:mt-0">
                <input
                    type="number"
                    min={1}
                    value={cantidadPedida}
                    onChange={(e) => setCantidadPedida(Number(e.target.value))}
                    className="w-full sm:w-28 px-3 py-2 border bg-white rounded-lg text-center text-base font-medium text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={producto.existencia === 0}
                    aria-label="Cantidad a pedir"
                />
                <button
                    onClick={handleAgregar}
                    disabled={isAddButtonDisabled}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-base font-semibold text-white shadow-md transition-all duration-300 ${isAddButtonDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-98"
                        }`}
                >
                    Agregar al Carrito
                </button>
            </div>
        </div>
    );
};