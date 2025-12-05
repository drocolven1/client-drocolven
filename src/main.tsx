import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";
import { AuthProvider } from "./components/hooks/useAuth.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <BrowserRouter>
        <Provider>
          <App />
        </Provider>
      </BrowserRouter>
    </AuthProvider>
);
