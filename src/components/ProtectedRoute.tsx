// components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

interface ProtectedRouteProps {
    redirectPath?: string;
    // Opcional: para restringir la ruta solo a ciertos roles, si tu app lo necesita
    // rolesPermitidos?: string[]; 
}

export const ProtectedRoute = ({ redirectPath = "/login" }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Muestra un loader mientras se comprueba el token de localStorage
    if (isLoading) {
        return <div>Cargando...</div>; 
    }

    // Si no está autenticado, redirige
    if (!isAuthenticated) {
        // Redirige al usuario a la página de inicio de sesión
        return <Navigate to={redirectPath} replace />;
    }

    // Si está autenticado, renderiza el componente hijo
    // <Outlet /> es crucial para renderizar las rutas anidadas o el elemento de la ruta
    return <Outlet />; 
};