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
import { useClienteStore } from "../components/carritoCliente/store/cliente.storage";

export type Usuario = {
  id: string;
  name: string;
  email: string;
  role: "user";
  rif: string;
  descripcion: string;
  descuento1: string;
  descuento2: string;
  limite_credito: string;
};

type AuthContextType = {
  token: string | null;
  login: (token: string, isClient?: boolean) => void;
  logout: (navigate?: NavigateFunction) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Usuario | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Usuario | null>(null);

  const validateToken = useCallback((token: string): boolean => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      return Date.now() < exp * 1000;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const zustandState = useClienteStore.getState();
    const storedClienteFromZustand = zustandState.clienteSeleccionado;

    if (storedToken && validateToken(storedToken)) {
      setToken(storedToken);

      if (storedClienteFromZustand) {
        // Usar datos del cliente persistido por Zustand si existe
        setUser(storedClienteFromZustand as any); // as any
      } else {
        // Intentar usar la decodificación del token si no hay cliente detallado
        try {
          const decodedToken = jwtDecode<Usuario>(storedToken);
          setUser(decodedToken);
        } catch (error) {
          logout();
        }
      }
    } else if (storedToken) {
      logout(); // Token expirado
    }

    setIsLoading(false);
  }, [validateToken]);

  const login = (token: string, isClient: boolean = false) => {
    try {
      const decodedToken = jwtDecode<Usuario>(token);
      setToken(token);
      setUser(decodedToken);
      console.log(decodedToken);
      localStorage.setItem("token", token);

      if (decodedToken.email) {
        localStorage.setItem("cliente_email", decodedToken.email);
      }

      // Llamar a Zustand para iniciar la persistencia del cliente
      if (isClient && decodedToken.rif) {
        // Asumimos que la información del token es suficiente para ClienteDetalle
        useClienteStore.getState().setClienteSeleccionado(decodedToken as any); //as clientDetalle
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  };

  const logout = (navigate?: NavigateFunction) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("cliente_email");

    // Limpiar el estado del cliente en Zustand
    useClienteStore.getState().limpiarCliente();

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
