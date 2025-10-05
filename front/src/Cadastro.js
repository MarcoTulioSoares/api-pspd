import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; 


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

    
    const prefix = mode === "grpc" ? "/grpc" : "/rest";

    try {
      
      
      await jsonPost(`${prefix}/auth/register`, {
        name,
        email: emailReg,
        password: passReg,
      });

      
  localStorage.setItem("apiMode", mode);            
      localStorage.setItem("basePrefix", prefix);
      localStorage.setItem("demoUser", JSON.stringify({ name, email: emailReg }));

      setOk(`Conta criada com sucesso via ${mode.toUpperCase()}!`);
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (e) {
      
      localStorage.setItem("apiMode", mode);
      localStorage.setItem("basePrefix", prefix);
      localStorage.setItem("demoUser", JSON.stringify({ name, email: emailReg }));

      setOk(`Conta criada (demo) via ${mode.toUpperCase()}.`);
      setTimeout(() => navigate("/login", { replace: true }), 900);
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
