function AuthTabs({ isLogin, setIsLogin, setMessage }) {
  return (
    <div className="tabs">
      <button
        className={isLogin ? "tab active-tab" : "tab"}
        type="button"
        onClick={() => {
          setIsLogin(true);
          setMessage("");
        }}
      >
        Giriş Yap
      </button>

      <button
        className={!isLogin ? "tab active-tab" : "tab"}
        type="button"
        onClick={() => {
          setIsLogin(false);
          setMessage("");
        }}
      >
        Kayıt Ol
      </button>
    </div>
  );
}

export default AuthTabs;
