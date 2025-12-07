import ClientLayout from "@/layouts/Client";
import { Wrench, Rocket, Construction, Sparkles } from "lucide-react";

const ComingSoon = () => {
  return (
    <ClientLayout>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
        {/* Fondo con estrellas animadas (opcional pero genial) */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse-medium delay-1000"></div>
          <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white rounded-full animate-pulse-fast delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse-slow delay-3000"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse-medium delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-2xl">
          <Sparkles className="mx-auto text-yellow-400 w-16 h-16 mb-4 animate-bounce-slow" />{" "}
          {/* Icono que rebota */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">
            ¡Próximamente!
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Estamos trabajando arduamente para traer esta nueva característica.
            ¡Mantente atento!
          </p>
          <div className="flex items-center justify-center space-x-6">
            <Wrench className="w-12 h-12 text-blue-400 animate-spin-slow" />{" "}
            {/* Icono que gira */}
            <Construction className="w-12 h-12 text-green-400 animate-pulse" />{" "}
            {/* Icono que pulsa */}
            <Rocket className="w-12 h-12 text-red-400 animate-shake" />{" "}
            {/* Icono que se sacude */}
          </div>
          <p className="mt-12 text-sm text-gray-500">
            Gracias por tu paciencia.
          </p>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ComingSoon;
