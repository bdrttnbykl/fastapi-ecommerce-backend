import { useState } from "react";
import { loginUser } from "../services/authService";

function LoginForm({ setMessage, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await loginUser(email, password);
      onLoginSuccess(data.access_token);
      setMessage("Giriş başarılı");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Giriş Yap</h2>
      <p className="subtext">Hesabınla sisteme giriş yap</p>

      <form onSubmit={handleLogin}>
        <label>E-posta</label>
        <input
          type="email"
          placeholder="E-posta gir"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Şifre</label>
        <input
          type="password"
          placeholder="Şifre gir"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </>
  );
}

export default LoginForm;
