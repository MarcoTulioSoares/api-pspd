import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";

const REST_API_BASE = "http://localhost:8080/api";
const REST_LOGIN_ENDPOINT = `${REST_API_BASE}/usuario/login`;

async function restLogin(email, password) {
  const res = await fetch(REST_LOGIN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha: password }),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const message = data?.message || data?.raw || text || "Falha no login REST.";
    throw new Error(typeof message === "string" ? message : "Falha no login REST.");
  }
  return data;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from?.pathname || "/quiz";

  async function doLogin(mode) {
    setErr(""); setOk("");

    if (!email || !password) {
      setErr("Digite email e senha.");
      return;
    }

    if (mode === "rest") {
      try {
        const user = await restLogin(email, password);
        const guessedName = (user?.email || email).split("@")[0] || "Aluno(a)";
        const tokenBase = user?.codigoUsuario ?? user?.id ?? email;

        localStorage.setItem("token", `rest-${tokenBase}`);
        localStorage.setItem("apiMode", mode);
        localStorage.setItem("basePrefix", REST_API_BASE);
        localStorage.setItem("userName", guessedName);

        setOk(`Login realizado via ${mode.toUpperCase()}!`);
        setTimeout(() => navigate(next, { replace: true }), 500);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Não foi possível autenticar via REST.";
        setErr(message || "Não foi possível autenticar via REST.");
      }
      return;
    }

    localStorage.setItem("token", "demo-token");
    localStorage.setItem("apiMode", mode);
    localStorage.setItem("basePrefix", "/grpc");

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
