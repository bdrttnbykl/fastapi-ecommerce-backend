import { useState } from "react";
import { registerUser } from "../services/authService";

function RegisterForm({ setMessage, setIsLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await registerUser(username, email, password);

      setMessage("Kayıt başarılı, şimdi giriş yapabilirsin");
      setUsername("");
      setEmail("");
      setPassword("");
      setIsLogin(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Kayıt Ol</h2>
      <p className="subtext">Yeni kullanıcı hesabı oluştur</p>

      <form onSubmit={handleRegister}>
        <label>Kullanıcı Adı</label>
        <input
          type="text"
          placeholder="Kullanıcı adı gir"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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
          {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
        </button>
      </form>
    </>
  );
}

export default RegisterForm;
