import { useEffect, useRef, useState } from "react";
import "./Quiz.css";

const REST_PREFIX = "/rest";
const GRPC_PREFIX = "/grpc";

const QUESTOES = [
  {
    id: 1,
    texto: "Questão 1 exemplo",
    alternativas: ["A", "B", "C", "D"],
    indiceResposta: 1,
    explicacao: "Explicação da questão 1",
  },
  {
    id: 2,
    texto: "Questão 2 exemplo",
    alternativas: ["E", "F", "G", "H"],
    indiceResposta: 2,
    explicacao: "Explicação da questão 2",
  },
];

function base(prefix) {
  return prefix === "/rest" ? REST_PREFIX : GRPC_PREFIX;
}

async function jsonFetch(url, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return { data };
}

function listenSSE(url, onData) {
  const es = new EventSource(url);
  es.onmessage = (ev) => {
    try { onData(JSON.parse(ev.data)); }
    catch { onData(ev.data); }
  };
  es.onerror = () => es.close();
  return () => es.close();
}

function Alternativa({ rotulo, texto, selecionada, estado, desabilitada, aoClicar }) {
  return (
    <button
      className={[
        "alternativas",
        selecionada ? "selecionada" : "",
        estado === "correta" ? "correta" : "",
        estado === "errada" ? "errada" : "",
      ].join(" ")}
      onClick={aoClicar}
      disabled={desabilitada}
    >
      <span className="option-label">{rotulo}.</span>
      <span className="option-text">{texto}</span>
    </button>
  );
}

function ModeToggle({ prefix, setPrefix }) {
  return (
    <div className="toggle">
      <button
        className={prefix === "/rest" ? "btn active" : "btn"}
        onClick={() => setPrefix("/rest")}
        type="button"
      >
        REST
      </button>
      <button
        className={prefix === "/grpc" ? "btn active" : "btn"}
        onClick={() => setPrefix("/grpc")}
        type="button"
      >
        gRPC
      </button>
    </div>
  );
}

export default function Quiz() {
  const [etapa, setEtapa] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [mostrarResposta, setMostrarResposta] = useState(false);

  const [prefix, setPrefix] = useState("/grpc");
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") || "" : "";

  const [hints, setHints] = useState([]);
  const stopRef = useRef(null);

  const total = QUESTOES.length;
  const questao = QUESTOES[etapa];
  const progresso = Math.round((etapa / total) * 100);
  const pontuacao = respostas.filter((r) => r.correta).length;

  async function validarNoBackend(questionId, answerText) {
    const url = `${base(prefix)}/quiz/${questionId}/validate`;
    const { data } = await jsonFetch(url, {
      method: "POST",
      body: { answer: answerText },
      token,
    });
    return data;
  }

  async function Confirmar() {
    if (selecionada === null) return;
    let correta = selecionada === questao.indiceResposta;

    try {
      const result = await validarNoBackend(questao.id, questao.alternativas[selecionada]);
      if (typeof result?.correct === "boolean") correta = result.correct;
      if (result?.explanation) questao.explicacao = result.explanation;
    } catch {}

    setRespostas((prev) => [...prev, { idQuestao: questao.id, correta }]);
    setMostrarResposta(true);
  }

  function Proxima() {
    setMostrarResposta(false);
    setSelecionada(null);
    setEtapa((e) => e + 1);
    pararHints();
    setHints([]);
  }

  function Reiniciar() {
    setEtapa(0);
    setSelecionada(null);
    setRespostas([]);
    setMostrarResposta(false);
    pararHints();
    setHints([]);
  }

  function pararHints() {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
  }

  useEffect(() => () => pararHints(), []);

  if (etapa >= total) {
    return (
      <div className="tela">
        <section className="cartao-inicial">
          <h1 className="titulo-cartao">Resultado</h1>
          <p className="progresso-cartao">
            Você acertou <b>{pontuacao}</b> de <b>{total}</b> perguntas 🎉
          </p>
                    <p className="progresso-cartao">
            Pontuação final: <b>{pontuacao}</b>
          </p>
          <button className="btn-reiniciar" onClick={Reiniciar}>
            Refazer quiz
          </button>
        </section>
      </div>
    );
  }

  return (
    <main className="tela">
      <section className="cartao">
        <header className="quiz-head">
          <div className="quiz-step">
            <strong>Pergunta {etapa + 1}</strong> / {total}
          </div>
          <div className="progresso-quiz">{progresso}% concluído</div>
          <ModeToggle prefix={prefix} setPrefix={setPrefix} />
        </header>

        <h2 className="questao-quiz">{questao.texto}</h2>

        <div className="opcoes">
          {questao.alternativas.map((alt, idx) => {
            const estaSelecionada = selecionada === idx;
            const estaCorreta = mostrarResposta && idx === questao.indiceResposta;
            const estaErrada = mostrarResposta && estaSelecionada && idx !== questao.indiceResposta;

            return (
              <Alternativa
                key={idx}
                rotulo={String.fromCharCode(65 + idx)}
                texto={alt}
                selecionada={estaSelecionada}
                estado={estaCorreta ? "correta" : estaErrada ? "errada" : undefined}
                desabilitada={mostrarResposta}
                aoClicar={() => !mostrarResposta && setSelecionada(idx)}
              />
            );
          })}
        </div>

        {!mostrarResposta ? (
          <div className="botoes">
            <button
              className="btn-reiniciar"
              style={{ opacity: selecionada === null ? 0.6 : 1 }}
              disabled={selecionada === null}
              onClick={Confirmar}
            >
              Confirmar ({prefix.replace("/", "").toUpperCase()})
            </button>
            <button className="btn-reiniciar" onClick={Reiniciar}>
              Reiniciar
            </button>

          </div>
        ) : (
          <div className="feedback">
            {selecionada === questao.indiceResposta ? (
              <h2 className="acerto">Parabéns, você acertou!</h2>
            ) : (
              <h2 className="erro">Você errou!</h2>
            )}
            <div className="explicacao-quiz">
              <p className="conteudo-feedback">{questao.explicacao}</p>
            </div>
            <button className="btn-reiniciar" onClick={Proxima}>
              Próxima pergunta
            </button>
          </div>
        )}
      </section>


    </main>
  );
}
