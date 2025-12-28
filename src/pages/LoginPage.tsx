import { useCliente } from "@/components/carritoCliente/hooks/useCliente";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "animate.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { seleccionarCliente } = useCliente();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Credenciales incorrectas");
      }

      const data = await response.json();
      const token = data.access_token;

      login(token, true);

      const clienteRif = data.rif;
      if (clienteRif) {
        await seleccionarCliente(clienteRif);
      } else {
        console.warn(
          "RIF del cliente no encontrado en la respuesta del login."
        );
      }

      navigate("/home");
    } catch (err) {
      setError((err as Error).message || "Error al iniciar sesión");
      console.error("Error de inicio de sesión:", err);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ✅ FONDO OSCURO CON PUNTOS VERDES */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-gray-900 to-black">
        {/* PUNTOS VERDES ANIMADOS */}
        <div className="absolute inset-0">
          {/* Capa 1 - Puntos grandes */}
          <div
            className="absolute top-20 left-20 w-4 h-4 bg-primary-400 rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute top-40 right-32 w-3 h-3 bg-primary-500 rounded-full opacity-50 animate-ping"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-40 left-1/4 w-2 h-2 bg-secondary-400 rounded-full opacity-70 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-5 h-5 bg-primary-500 rounded-full opacity-40 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          ></div>

          {/* Capa 2 - Puntos medianos */}
          <div
            className="absolute top-1/2 left-10 w-2 h-2 bg-primary-400 rounded-full opacity-50 animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute top-60 right-1/3 w-3 h-3 bg-secondary-500 rounded-full opacity-60 animate-ping"
            style={{ animationDelay: "0.8s" }}
          ></div>
          <div
            className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-primary-400 rounded-full opacity-70 animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>

          {/* Capa 3 - Puntos pequeños */}
          <div
            className="absolute top-10 right-10 w-1.5 h-1.5 bg-primary-300 rounded-full opacity-40 animate-ping"
            style={{ animationDelay: "2.5s" }}
          ></div>
          <div
            className="absolute top-80 left-1/2 w-2 h-2 bg-secondary-400 rounded-full opacity-50 animate-bounce"
            style={{ animationDelay: "1.2s" }}
          ></div>
          <div
            className="absolute bottom-60 right-1/4 w-1 h-1 bg-primary-500 rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Overlay sutil para contraste */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full h-14 border-b border-primary-500/30 backdrop-blur-xl z-50 flex items-center px-6 sm:px-10 shadow-2xl">
        <img
          src="./icon_drocolven.png"
          alt="logo drocolven"
          className="h-12 mr-4"
        />
        <p className="text-2xl text-white font-bold">DROCOLVEN</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen gap-12 lg:gap-32 p-8 lg:p-16 pt-24 relative z-10">
        {/* TEXTO DE BIENVENIDA */}
        <div className="text-left lg:text-center max-w-3xl lg:max-w-6xl order-2 lg:order-1">
          <h1 className="animate__animated animate__fadeInLeft text-5xl lg:text-8xl font-black mb-8 leading-tight bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent drop-shadow-2xl">
            Bienvenido a Drocolven
          </h1>
          <p className="animate__animated animate__bounceInUp text-xl lg:text-4xl mb-8 text-slate-200 font-semibold drop-shadow-lg leading-relaxed">
            Tu droguería de confianza con{" "}
            <span className="text-primary-300"> catálogo exclusivo</span>.
          </p>
          <div className="flex flex-col items-center text-lg lg:text-xl text-slate-300 space-y-4">
            <p className="flex items-center gap-3 animate__animated animate__bounceInUp">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-ping"></span>
              Accede a tu carrito y ofertas especiales
            </p>
            <p className="animate__animated animate__bounceInUp">
              ¿Nuevo cliente?{" "}
              <span
                className="font-bold text-primary-300 underline"
                onClick={() => {
                  // Redirige y hace scroll automático
                  window.location.href =
                    "https://landingpage-drocolven.vercel.app/#contacto";
                  // O con scroll suave después de cargar:
                  // window.location.href = '/contacto#formulario-contacto';
                }}
              >
                Contáctanos
              </span>
            </p>
          </div>
        </div>

        {/* FORMULARIO - GLASSMORPHISM */}
        <div className="animate__animated animate__backInRight w-full max-w-md lg:max-w-lg order-1 lg:order-2 bg-white/5 backdrop-blur-2xl border border-primary-400/30 rounded-3xl shadow-2xl shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-500 p-8">
          <div className="text-center mb-10">
            <img
              src="./icon_drocolven.png"
              alt="logo drocolven"
              className="h-22 mx-auto"
            />
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-2 drop-shadow-xl">
              Acceso Clientes
            </h2>
            <p className="text-primary-200 font-semibold text-lg">
              Inicia sesión en tu cuenta
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/50 backdrop-blur-xl text-red-100 px-6 py-4 rounded-2xl mb-6 shadow-xl shadow-red-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-transparent h-full w-2 left-0"></div>
              <div className="relative z-10">
                <p className="font-bold text-lg mb-1 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Error de inicio de sesión
                </p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-200 mb-3"
              >
                📧 Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="cliente@drocolven.com"
                className="w-full p-4 border-2 border-white/30 bg-white/10 backdrop-blur-xl rounded-2xl text-white placeholder-slate-400 font-semibold text-lg focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/40 transition-all duration-300 shadow-lg hover:shadow-primary-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-200 mb-3"
              >
                🔒 Contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••••••"
                className="w-full p-4 border-2 border-white/30 bg-white/10 backdrop-blur-xl rounded-2xl text-white placeholder-slate-400 font-semibold text-lg focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-500/40 transition-all duration-300 shadow-lg hover:shadow-primary-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 px-8 text-xl font-black bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 active:scale-[0.98] rounded-3xl shadow-2xl shadow-primary-500/50 hover:shadow-primary-500/70 border border-primary-400/50 backdrop-blur-xl transition-all duration-500 text-white uppercase tracking-wider"
            >
              🚀 Entrar a la Plataforma
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm text-slate-300 mb-4">¿Nuevo en Drocolven?</p>
            <Button
              size="lg"
              color="secondary"
              onPress={() => {
                // Redirige y hace scroll automático
                window.location.href =
                  "https://landingpage-drocolven.vercel.app/#contacto";
                // O con scroll suave después de cargar:
                // window.location.href = '/contacto#formulario-contacto';
              }}
              className="w-full bg-white/20 hover:bg-white/30 border-white/40 backdrop-blur-xl text-white font-bold py-3 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-primary-400/30"
            >
              📞 Solicitar Acceso
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
