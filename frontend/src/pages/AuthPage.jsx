import { useState } from "react";
import AuthTabs from "../components/AuthTabs";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  return (
    <div className="page">
      <div className="overlay"></div>

      <div className="container">
        <div className="left">
          <span className="badge">E-Commerce Admin</span>
          <h1>FastAPI ile modern kullanıcı sistemi</h1>
          <p>
            Frontend tarafını modüllere ayırdık. Artık her iş kendi bileşeninde,
            daha temiz ve yönetilebilir.
          </p>

          <div className="features">
            <div className="feature-card">
              <h3>Modüler Yapı</h3>
              <p>Login, register ve servisler ayrı dosyalarda tutulur.</p>
            </div>

            <div className="feature-card">
              <h3>Temiz Kod</h3>
              <p>App.jsx şişmez, yönetim kolaylaşır.</p>
            </div>

            <div className="feature-card">
              <h3>Geliştirilebilir</h3>
              <p>Sonradan dashboard, navbar, profile rahat eklenir.</p>
            </div>
          </div>
        </div>

        <div className="right">
          <div className="login-card">
            <AuthTabs
              isLogin={isLogin}
              setIsLogin={setIsLogin}
              setMessage={setMessage}
            />

            {isLogin ? (
              <LoginForm setMessage={setMessage} onLoginSuccess={onLoginSuccess} />
            ) : (
              <RegisterForm setMessage={setMessage} setIsLogin={setIsLogin} />
            )}

            {message && <div className="bottom-text">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
