import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { NavigateFunction } from "react-router-dom";
// import axios from 'axios'; // ❌ Eliminado axios

// Tipos de TypeScript
export type Usuario = {
  id: string;
  name: string;
  email: string;
  role: "user";
  rif?: string; // Agregado para clientes
};

type AuthContextType = {
  token: string | null;
  login: (token: string, isClient?: boolean) => void; // Nota: Actualizado para reflejar el parámetro opcional
  logout: (navigate?: NavigateFunction) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Usuario | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Usuario | null>(null);

  const validateToken = useCallback((token: string): boolean => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      // El token es válido si el tiempo actual es menor que el tiempo de expiración
      return Date.now() < exp * 1000;
    } catch (error) {
      console.log("Error al decodificar el token:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    // Buscar primero cliente, luego usuario admin
    const storedClient = localStorage.getItem("cliente");
    const storedUser = localStorage.getItem("usuario");
    let userObj: Usuario | null = null;
    if (storedToken && (storedClient || storedUser)) {
      if (validateToken(storedToken)) {
        setToken(storedToken);
        if (storedClient) {
          userObj = JSON.parse(storedClient);
        } else if (storedUser) {
          userObj = JSON.parse(storedUser);
        }
        setUser(userObj);

        // NOTA: Con fetch, debes pasar el header 'Authorization'
        // en CADA solicitud. No hay una configuración global como en axios.
        // Revisa todas tus funciones de API para agregar:
        // headers: { 'Authorization': `Bearer ${storedToken}` }
      } else {
        logout();
      }
    }
    setIsLoading(false);
  }, [validateToken]);

  const login = (token: string, isClient: boolean = false) => {
    try {
      const decodedToken = jwtDecode<Usuario>(token);
      setToken(token);
      setUser(decodedToken);
      if (isClient) {
        localStorage.setItem("cliente", JSON.stringify(decodedToken));
      } else {
        localStorage.setItem("usuario", JSON.stringify(decodedToken));
      }
      localStorage.setItem("token", token);
      if (decodedToken.email) {
        localStorage.setItem("cliente_email", decodedToken.email);
      }

      // NOTA: Se eliminó axios.defaults.headers.common['Authorization']
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  };

  const logout = (navigate?: NavigateFunction) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("cliente");
    localStorage.removeItem("token");
    localStorage.removeItem("cliente_email");

    // NOTA: Se eliminó delete axios.defaults.headers.common['Authorization'];

    if (navigate) {
      navigate("/login", { replace: true });
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ token, login, logout, isAuthenticated, isLoading, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
