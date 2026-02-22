// App.tsx
import { Route, Routes } from "react-router-dom";
import { CarritoClientePage } from "./pages/CarritoClientPage";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // 👈 Importa tu componente de protección
import LoginPage from "./pages/LoginPage";
import { InfoPedidoPage } from "./pages/InfoPedidosPage";
import InfoClientePage from "./pages/InfoClientPage";
// import { IndexPage } from "./pages/IndexPage";
// import PagosPage from "./pages/PagosPage";
// import ComingSoon from "./pages/ComingSoon";
import ReclamosPage from "./pages/ReclamosPage";
import { SupportForm } from "./pages/Soporte";

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<ProtectedRoute />}>
        <Route element={<InfoClientePage />} path="/home" />
        <Route element={<InfoPedidoPage />} path="/mispedidos" />
        <Route element={<CarritoClientePage />} path="/catalogo" />
        <Route element={<ReclamosPage />} path="/reclamos" />
        {/* <Route element={<PagosPage />} path="/pagos" /> */}
        {/* <Route element={<ComingSoon />} path="/cuentas" /> */}
        {/* <Route element={<ComingSoon />} path="/facturas" /> */}
        {/* <Route element={<ComingSoon />} path="/informacion" /> */}
        <Route element={<SupportForm />} path="/soporte" />
        <Route element={<LoginPage />} path="/*" />
      </Route>
    </Routes>
  );
}

export default App;
