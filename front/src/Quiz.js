import { useEffect, useState } from "react";
import { api } from "./api";
import "./Quiz.css";

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

  const [prefix, setPrefix] = useState("/rest");
  const [questoes, setQuestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const total = questoes.length;
  const questao = questoes[etapa];
  const progresso = Math.round((etapa / total) * 100);
  const pontuacao = respostas.filter((r) => r.correta).length;

  useEffect(() => {
    async function carregar() {
      setErro("");
      setCarregando(true);
      try {
        const itens = await api.listarPerguntas();
        setQuestoes(itens);
      } catch (e) {
        setErro(e.message || "Não foi possível carregar as perguntas.");
        setQuestoes([]);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  async function Confirmar() {
    if (selecionada === null || !questao) return;
    const correta = selecionada === questao.correctIndex;

    setRespostas((prev) => [...prev, { idQuestao: questao.id, correta }]);
    setMostrarResposta(true);
  }

  function Proxima() {
    setMostrarResposta(false);
    setSelecionada(null);
    setEtapa((e) => e + 1);
  }

  function Reiniciar() {
    setEtapa(0);
    setSelecionada(null);
    setRespostas([]);
    setMostrarResposta(false);
  }

  if (carregando) {
    return (
      <div className="tela">
        <section className="cartao-inicial">
          <h1 className="titulo-cartao">Quiz</h1>
          <p className="progresso-cartao">Carregando perguntas...</p>
        </section>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="tela">
        <section className="cartao-inicial">
          <h1 className="titulo-cartao">Quiz</h1>
          <p className="progresso-cartao">{erro}</p>
        </section>
      </div>
    );
  }

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

  if (!questao) {
    return (
      <div className="tela">
        <section className="cartao-inicial">
          <h1 className="titulo-cartao">Quiz</h1>
          <p className="progresso-cartao">Nenhuma pergunta cadastrada.</p>
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

        <h2 className="questao-quiz">{questao.text}</h2>

        <div className="opcoes">
          {questao.options.map((alt, idx) => {
            const estaSelecionada = selecionada === idx;
            const estaCorreta = mostrarResposta && idx === questao.correctIndex;
            const estaErrada = mostrarResposta && estaSelecionada && idx !== questao.correctIndex;

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
              <p className="conteudo-feedback">{questao.explanation || ""}</p>
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
