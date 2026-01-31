// App.tsx
import { Route, Routes } from "react-router-dom";
import { CarritoClientePage } from "./pages/CarritoClientPage";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // 👈 Importa tu componente de protección
import LoginPage from "./pages/LoginPage";
// import { IndexPage } from "./pages/IndexPage";
import ComingSoon from "./pages/ComingSoon";
import { InfoPedidoPage } from "./pages/InfoPedidosPage";
import InfoClientePage from "./pages/InfoClientPage";
import PagosPage from "./pages/PagosPage";
import ReclamosPage from "./pages/ReclamosPage";
import { SupportForm } from "./pages/Soporte";

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<ProtectedRoute />}>
        <Route element={<InfoClientePage />} path="/home" />
        <Route element={<PagosPage />} path="/pagos" />
        <Route element={<InfoPedidoPage />} path="/mispedidos" />
        <Route element={<CarritoClientePage />} path="/catalogo" />
        <Route element={<ReclamosPage />} path="/reclamos" />
        <Route element={<ComingSoon />} path="/cuentas" />
        <Route element={<ComingSoon />} path="/facturas" />
        <Route element={<ComingSoon />} path="/informacion" />
        <Route element={<SupportForm />} path="/soporte" />
        <Route element={<LoginPage />} path="/*" />
      </Route>
    </Routes>
  );
}

export default App;
