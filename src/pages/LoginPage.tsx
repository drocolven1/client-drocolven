import { useCliente } from "@/components/carritoCliente/hooks/useCliente";
import { useAuth } from "@/components/hooks/useAuth";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

      // 1. Guardar la sesión (token y usuario base)
      login(token, true);

      // 2. Lógica Adicional: Cargar el detalle del cliente
      const clienteRif = data.rif; // 👈 Asumiendo que la API devuelve el RIF en el body

      if (clienteRif) {
        // Llama a tu hook para obtener y guardar el detalle del cliente en Zustand
        await seleccionarCliente(clienteRif);
      } else {
        console.warn(
          "RIF del cliente no encontrado en la respuesta del login."
        );
      }

      // Opcional: Navegar a la página principal o protegida
      navigate("/home");
    } catch (err) {
      setError((err as Error).message || "Error al iniciar sesión");
      console.error("Error de inicio de sesión:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen gap-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="fixed top-0 left-0 w-full h-14 border-b border-primary-200 flex items-center px-10 shadow-2xl font-extrabold">
        <p className="text-2xl font-bold">Drocolven</p>
      </div>

      {/* TEXTO DE BIENVENIDA MEJORADO */}
      <div className="text-4xl max-w-2xl font-extrabold">
        <p className="mb-4">
          👋 ¡Hola! Bienvenido a Drocolven, tu droguería de confianza.
        </p>
        <p className="text-3xl font-semibold mb-6 text-gray-300">
          Inicia sesión para acceder a tu carrito y catálogo exclusivo.
        </p>
        <p className="text-xl font-normal mt-10">
          ¿Aún no tienes una cuenta de cliente?
          <br />
          <span className="font-semibold text-primary-300">
            Ponte en contacto con nuestro equipo
          </span>{" "}
          para comenzar tu registro.
          <Button className="m-4" color="primary">
            Solicitar Acceso
          </Button>
        </p>
      </div>

      {/* FORMULARIO DE INICIO DE SESIÓN */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 shadow-neon-green">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Acceso Clientes
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <p className="font-semibold">Error al iniciar sesión:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Correo electrónico (Usuario)
            </label>
            <input
              type="email"
              id="email"
              placeholder="ejemplo@tuempresa.com" // Añadimos un placeholder
              className="w-full p-2 mt-2 border border-gray-300 rounded-md text-gray-900" // Aseguramos color de texto
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••" // Añadimos un placeholder
              className="w-full p-2 mt-2 border border-gray-300 rounded-md text-gray-900" // Aseguramos color de texto
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-bold bg-green-600 hover:bg-green-700 rounded-md transition duration-150"
          >
            Entrar a la Plataforma
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
