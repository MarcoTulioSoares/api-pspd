import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "./api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from?.pathname || "/quiz";

  async function doLoginRest() {
    setErr("");
    setOk("");

    if (!email || !password) {
      setErr("Digite email e senha.");
      return;
    }

    setLoading(true);
    try {
      const usuario = await api.login(email, password);
      const token = usuario?.codigoUsuario ? String(usuario.codigoUsuario) : "rest-token";

      localStorage.setItem("token", token);
      localStorage.setItem("apiMode", "rest");
      localStorage.setItem("basePrefix", "/rest");
      localStorage.setItem("userEmail", usuario?.email || email);
      localStorage.setItem(
        "userName",
        (usuario?.email || email).split("@")[0] || "Aluno(a)"
      );
      if (typeof usuario?.pontuacao === "number") {
        localStorage.setItem("userPontuacao", String(usuario.pontuacao));
      }

      setOk("Login realizado via REST!");
      setTimeout(() => navigate(next, { replace: true }), 500);
    } catch (error) {
      setErr(error?.message || "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  function showGrpcMessage() {
    setErr("Integração gRPC ainda não está disponível.");
    setOk("");
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
          <button className="btn-login" type="button" onClick={showGrpcMessage} disabled={loading}>
            Entrar com gRPC
          </button>
          <button className="btn-login outline" type="button" onClick={doLoginRest} disabled={loading}>
            {loading ? "Entrando..." : "Entrar com REST"}
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
