import { useNavigate, useLocation } from "react-router-dom";
import { Compass, Heart, Wallet, User } from "lucide-react";

const navItems = [
  { id: "jornada", label: "Jornada", icon: Compass, path: "/app/jornada" },
  { id: "saude", label: "Saúde", icon: Heart, path: "/app/saude" },
  { id: "financas", label: "Finanças", icon: Wallet, path: "/app/financas" },
  { id: "perfil", label: "Perfil", icon: User, path: "/app/perfil" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/app/jornada") {
      return location.pathname.startsWith("/app/jornada") || location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-content">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            <div className="nav-icon-bg">
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
