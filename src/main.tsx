import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/styles/fonts.css"
import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";
import { AuthProvider } from "./hooks/useAuth.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <BrowserRouter>
        <Provider>
          <App />
        </Provider>
      </BrowserRouter>
    </AuthProvider>
);
