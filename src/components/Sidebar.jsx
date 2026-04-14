import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Sidebar.css";

const navItems = [
  { id: "inventory", icon: "📦", label: "Inventory" },
  { id: "flowers",   icon: "🌸", label: "Flowers"   },
  { id: "orders",    icon: "🧾", label: "Orders"     },
  { id: "settings",  icon: "⚙️",  label: "Settings"   },
];

export default function Sidebar({ activePage, onNavigate, user }) {
  return (
    <>
      <header className="mobile-topbar">
        <div className="topbar-brand">
          <span>📦</span> Stockr
        </div>
        <span className="mobile-user">{user.email}</span>
      </header>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">📦</span>
          <span className="sidebar-logo-text">Stockr</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button className="signout-btn" onClick={() => signOut(auth)}>
            Sign Out
          </button>
        </div>
      </aside>

      <nav className="mobile-bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}