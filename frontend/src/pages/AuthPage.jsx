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
