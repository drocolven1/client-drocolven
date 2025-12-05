// App.tsx
import { Route, Routes } from "react-router-dom";
import { CarritoClientePage } from "./pages/CarritoClientPage";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // 👈 Importa tu componente de protección
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<ProtectedRoute />}>
        <Route element={<CarritoClientePage />} path="/" />
        <Route element={<CarritoClientePage />} path="/*" />
      </Route>
    </Routes>
  );
}

export default App;
