// App.tsx
import { Route, Routes } from "react-router-dom";
import IndexPage from "@/pages/index";
import { CarritoClientePage } from "./pages/CarritoClientPage";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // 👈 Importa tu componente de protección
import LoginPage from "./pages/LoginPage";

function App() {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route element={<IndexPage />} path="/" />
            <Route element={<LoginPage />} path="/login" />
            {/* Aquí puedes agregar la ruta para /login */}
            
            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />} > {/* Este es el Layout de protección */}
                {/* Todas las rutas anidadas dentro de aquí requieren autenticación. 
                  Si la protección falla, el usuario será redirigido a /login
                */}
                <Route element={<CarritoClientePage />} path="/car" /> 
                {/* Puedes añadir más rutas protegidas aquí, ej: /perfil, /ordenes, etc. */}
            </Route>

        </Routes>
    );
}

export default App;