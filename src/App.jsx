import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import LoginPage from "./pages/LoginPage";
import InventoryPage from "./pages/InventoryPage";
import Sidebar from "./components/Sidebar";
import "./App.css";
import "./styles/Layout.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState("inventory");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  if (authLoading) {
    return (
      <div className="splash">
        <span>📦</span>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={user} />
      <main className="app-main">
        {activePage === "inventory" && <InventoryPage user={user} />}
        {activePage === "dashboard" && (
          <div className="coming-soon">
            <span>📊</span>
            <h2>Dashboard</h2>
            <p>Coming soon</p>
          </div>
        )}
        {activePage === "reports" && (
          <div className="coming-soon">
            <span>📈</span>
            <h2>Reports</h2>
            <p>Coming soon</p>
          </div>
        )}
        {activePage === "settings" && (
          <div className="coming-soon">
            <span>⚙️</span>
            <h2>Settings</h2>
            <p>Coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}