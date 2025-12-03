import { useCliente } from "@/components/carritoCliente/hooks/useCliente";
import { useAuth } from "@/components/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { seleccionarCliente} = useCliente();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Si ya está autenticado, navega inmediatamente
      navigate("/", { replace: true });
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
      login(token, true); // Asumiendo que isClient: true para este login

      // 2. 🚀 Lógica Adicional: Cargar el detalle del cliente 🚀
      // Si el token decodificado contiene el 'rif' del cliente,
      // debes usar ese 'rif' para obtener y guardar el detalle completo.
      // Para esto, necesitarías decodificar el token aquí, o
      // simplemente asumir que el email del login es suficiente para la selección

      // Opción 1 (Si tienes una forma de obtener el RIF/ID del cliente logueado):
      // const clienteRif = obtenerRifDelToken(token); // Función hipotética

      // Opción 2 (Si la API de login devuelve el RIF/ID, lo cual es más eficiente):
      const clienteRif = data.rif; // 👈 Supongamos que la API devuelve el RIF en el body

      if (clienteRif) {
        // Llama a tu hook para obtener y guardar el detalle del cliente en Zustand
        await seleccionarCliente(clienteRif);
      } else {
        console.warn(
          "RIF del cliente no encontrado en la respuesta del login."
        );
        // Opcional: manejar si no hay RIF (ej. un usuario administrador)
      }

      // Opcional: Navegar a la página principal o protegida
      navigate("/");
    } catch (err) {
      setError((err as Error).message || "Error al iniciar sesión");
      console.error("Error de inicio de sesión:", err);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>

        {error && (
          <div className="text-red-500 text-center mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
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
              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
