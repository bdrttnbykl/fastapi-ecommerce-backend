import { useEffect, useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage";
import ProductsAdminPage from "./pages/ProductsAdminPage";
import StorePage from "./pages/StorePage";
import { fetchCurrentUser } from "./services/authService";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [adminView, setAdminView] = useState("store");

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      setLoadingUser(true);
      try {
        const me = await fetchCurrentUser(token);
        setUser(me);
      } catch {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [token]);

  const handleLoginSuccess = (nextToken) => {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setAdminView("store");
  };

  const content = useMemo(() => {
    if (!token) {
      return <AuthPage onLoginSuccess={handleLoginSuccess} />;
    }

    if (loadingUser || !user) {
      return <div style={{ padding: 24 }}>Yükleniyor...</div>;
    }

    if (user.role === "admin") {
      if (adminView === "store") {
        return (
          <StorePage
            token={token}
            user={user}
            onLogout={handleLogout}
            showViewSwitch
            adminView={adminView}
            onAdminViewChange={setAdminView}
          />
        );
      }

      return (
        <ProductsAdminPage
          token={token}
          onLogout={handleLogout}
          showViewSwitch
          adminView={adminView}
          onAdminViewChange={setAdminView}
        />
      );
    }

    return <StorePage token={token} user={user} onLogout={handleLogout} />;
  }, [token, loadingUser, user, adminView]);

  return content;
}

export default App;
