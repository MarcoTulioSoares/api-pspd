import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from?.pathname || "/quiz";

  function doLogin(mode) {
    setErr(""); setOk("");

    if (!email || !password) {
      setErr("Digite email e senha.");
      return;
    }

    
    localStorage.setItem("token", "demo-token");
  localStorage.setItem("apiMode", mode);              
    localStorage.setItem("basePrefix", mode === "grpc" ? "/grpc" : "/rest");

    const guessedName = email.split("@")[0] || "Aluno(a)";
    localStorage.setItem("userName", guessedName);

    setOk(`Login realizado via ${mode.toUpperCase()}!`);
    setTimeout(() => navigate(next, { replace: true }), 500);
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={(e) => e.preventDefault()}>
        <h1 className="login-title">Login</h1>
        <p className="texto-inicial">Digite seu email e senha para acessar o Quiz.</p>

        <label className="login-label">Email</label>
        <input
          className="login-input"
          placeholder="seu@email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="login-label">Senha</label>
        <input
          className="login-input"
          type="password"
          placeholder="sua senha"
          value={password}
          onChange={(e) => setPass(e.target.value)}
        />

        
        <div className="btn-row">
          <button className="btn-login" type="button" onClick={() => doLogin("grpc")}>
            Entrar com gRPC
          </button>
          <button className="btn-login outline" type="button" onClick={() => doLogin("rest")}>
            Entrar com REST
          </button>
        </div>

        <div className="login-links2" style={{ marginTop: 10 }}>
          Não possui uma conta?{" "}
          <Link to="/cadastro" style={{ textDecoration: "underline", color: "#fff" }}>
            Criar uma
          </Link>
        </div>

        {ok ? <p className="msg ok">{ok}</p> : null}
        {err ? <p className="msg err">{err}</p> : null}

        <div className="login-links">
          <Link to="/">Voltar</Link>
        </div>
      </form>
    </div>
  );
}
