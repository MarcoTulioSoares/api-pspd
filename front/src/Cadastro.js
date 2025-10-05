import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const REST_API_BASE = "http://localhost:8080/api";
const REST_REGISTER_ENDPOINT = `${REST_API_BASE}/usuario`;

async function jsonPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return data;
}

export default function Cadastro() {
  const [name, setName] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [passReg, setPassReg] = useState("");
  const [passReg2, setPassReg2] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  async function doRegister(mode) {
    setErr(""); setOk("");

    if (!name || !emailReg || !passReg || !passReg2) {
      setErr("Preencha todos os campos.");
      return;
    }
    if (passReg !== passReg2) {
      setErr("As senhas não coincidem.");
      return;
    }

    const isGrpc = mode === "grpc";
    const registerUrl = isGrpc ? "/grpc/auth/register" : REST_REGISTER_ENDPOINT;

    try {
      if (isGrpc) {
        await jsonPost(registerUrl, {
          name,
          email: emailReg,
          password: passReg,
        });
      } else {
        await jsonPost(registerUrl, {
          email: emailReg,
          senha: passReg,
          pontuacao: 0,
        });
      }

      localStorage.setItem("apiMode", mode);
      localStorage.setItem("basePrefix", isGrpc ? "/grpc" : REST_API_BASE);
      localStorage.setItem("demoUser", JSON.stringify({ name, email: emailReg }));

      setOk(`Conta criada com sucesso via ${mode.toUpperCase()}!`);
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (e) {
      if (isGrpc) {
        localStorage.setItem("apiMode", mode);
        localStorage.setItem("basePrefix", "/grpc");
        localStorage.setItem("demoUser", JSON.stringify({ name, email: emailReg }));

        setOk(`Conta criada (demo) via ${mode.toUpperCase()}.`);
        setTimeout(() => navigate("/login", { replace: true }), 900);
        return;
      }

      const message = e instanceof Error ? e.message : "Não foi possível criar a conta via REST.";
      setErr(message || "Não foi possível criar a conta via REST.");
    }
  }

  return (
    <div className="login-wrap">
      <form className="cadastro-card" onSubmit={(e) => e.preventDefault()}>
        <h1 className="login-title">Criar uma conta</h1>
        <p className="texto-inicial">Preencha os dados para começar o Quiz.</p>

        <label className="login-label">Nome</label>
        <input
          className="login-input"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="login-label">Email</label>
        <input
          className="login-input"
          placeholder="seu@email"
          value={emailReg}
          onChange={(e) => setEmailReg(e.target.value)}
        />

        <label className="login-label">Senha</label>
        <input
          className="login-input"
          type="password"
          placeholder="crie uma senha"
          value={passReg}
          onChange={(e) => setPassReg(e.target.value)}
        />

        <label className="login-label">Confirmar senha</label>
        <input
          className="login-input"
          type="password"
          placeholder="repita a senha"
          value={passReg2}
          onChange={(e) => setPassReg2(e.target.value)}
        />

        
        <div className="btn-row">
          <button className="btn-login" type="button" onClick={() => doRegister("grpc")}>
            Criar conta com gRPC
          </button>
          <button className="btn-login outline" type="button" onClick={() => doRegister("rest")}>
            Criar conta com REST
          </button>
        </div>

        {ok ? <p className="msg ok">{ok}</p> : null}
        {err ? <p className="msg err">{err}</p> : null}

        <div className="login-links2">
          Já possui conta?{" "}
          <Link to="/login" style={{ textDecoration: "underline", color: "#fff" }}>
            Fazer login
          </Link>
        </div>
      </form>
    </div>
  );
}
