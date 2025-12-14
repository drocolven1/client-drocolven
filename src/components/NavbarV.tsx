import React, { useRef} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Apple,
  Cable,
  CalendarCheck,
  ClosedCaption,
  CreditCard,
  House,
  Info,
  LogOut,
  MenuIcon,
  MessageSquareWarning,
  ReceiptText,
  ShoppingCart,
  User,
} from "lucide-react";
import { Button } from "@heroui/button";

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navLinks: NavLink[] = [
  { label: "Inicio", href: "/home", icon: <House className="w-5 h-5" /> },
  { label: "Perfil", href: "/perfil", icon: <User className="w-5 h-5" /> },
  {
    label: "Pedidos",
    href: "/mispedidos",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  { label: "Catálogo", href: "/catalogo", icon: <Apple className="w-5 h-5" /> },
  {
    label: "Reclamos",
    href: "/reclamos",
    icon: <MessageSquareWarning className="w-5 h-5" />,
  },
  { label: "Pagos", href: "/pagos", icon: <CreditCard className="w-5 h-5" /> },
  {
    label: "Cuentas x Pagar",
    href: "/cuentas",
    icon: <CalendarCheck className="w-5 h-5" />,
  },
  {
    label: "Facturas",
    href: "/facturas",
    icon: <ReceiptText className="w-5 h-5" />,
  },
  {
    label: "Información",
    href: "/informacion",
    icon: <Info className="w-5 h-5" />,
  },
  { label: "Soporte", href: "/soporte", icon: <Cable className="w-5 h-5" /> },
];

const NavbarV: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [showLabels, setShowLabels] = React.useState(true);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const navRef = useRef<HTMLElement | null>(null);

  const handleNav = (href: string) => {
    if (location.pathname !== href) {
      setLoading(true);
      navigate(href);
      setTimeout(() => setLoading(false), 400); // Simula un loading breve
    }
  };

  return (
    <nav
      ref={navRef}
      className={`h-full min-h-screen w-56 shadow-sm flex flex-col items-center py-6 transition-all duration-300 bg-gradient-to-br from-gray-900 to-gray-800 `}
      style={{
        width: showLabels ? "14rem" : "4rem",
        transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Logo y Toggle */}
      <div className="flex flex-row items-center gap-2 mb-8 w-full px-2 relative">
        <span className="text-xl font-semibold text-white hidden md:block mx-auto absolute left-1/2 -translate-x-1/2">
          DROCOLVEN
        </span>
        <button
          aria-label={
            showLabels ? "Ocultar descripciones" : "Mostrar descripciones"
          }
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors md:hidden ml-auto"
          onClick={() => setShowLabels((v) => !v)}
        >
          {showLabels ? (
            <ClosedCaption className="w-5 h-5" />
          ) : (
            <MenuIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      {/* Nav links vertical */}
      <div className="flex flex-col gap-4 w-full items-start px-2">
        {navLinks.map((link, idx) => (
          <button
            key={link.href}
            onClick={() => handleNav(link.href)}
            className={`flex flex-row items-center gap-2 hover:text-primary transition-colors text-xs md:text-sm font-medium px-2 py-2 rounded-md w-full justify-start ${location.pathname === link.href ? "bg-gray-100 font-semibold text-primary" : "text-white"}`}
            aria-current={location.pathname === link.href ? "page" : undefined}
            disabled={loading}
          >
            {link.icon}
            <span
              ref={(el) => {
                labelsRef.current[idx] = el;
              }}
              style={{ display: showLabels ? "inline" : "none", minWidth: 0 }}
              className="overflow-hidden whitespace-nowrap transition-all duration-300"
            >
              {link.label}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center w-full">
        <Button
          variant="ghost"
          className="flex flex-row items-center gap-1 text-white hover:text-red-500 px-2 py-2 text-xs md:text-sm font-medium w-full justify-start"
          onPress={() => logout(navigate)}
        >
          <LogOut className="w-5 h-5" />
          <span
            ref={(el) => {
              labelsRef.current[navLinks.length] = el;
            }}
            style={{ display: showLabels ? "inline" : "none", minWidth: 0 }}
            className="overflow-hidden whitespace-nowrap transition-all duration-300"
          >
            Salir
          </span>
        </Button>
      </div>
    </nav>
  );
};

export default NavbarV;
