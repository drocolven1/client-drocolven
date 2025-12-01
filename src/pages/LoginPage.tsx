import { useAuth } from "@/components/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login/`, {
        method: "POST", // 👈 Indica el método HTTP
        headers: {
          // 👈 Especifica el tipo de contenido que envías
          "Content-Type": "application/json",
        },
        // 👈 Convierte el objeto a una cadena JSON
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        // Si la respuesta no es exitosa (ej: 400, 500), lanza un error
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error en la solicitud");
      }

      // Procesa la respuesta exitosa
      const data = await response.json();
      login(data.access_token); // 👈 Usa login del contexto
    } catch (err) {
      // En `fetch`, el `catch` solo se activa por errores de red o los errores que lanzamos manualmente
      const errorMessage = (err as Error).message || "Error al iniciar sesión";
      setError(errorMessage);
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
