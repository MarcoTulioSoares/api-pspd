import { useCallback, useEffect, useMemo, useState } from "react";
import "./Quiz.css";
import { api } from "./api";

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

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [etapa, setEtapa] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [mostrarResposta, setMostrarResposta] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const itens = await api.listarPerguntas();
      setQuestions(Array.isArray(itens) ? itens : []);
      setEtapa(0);
      setSelecionada(null);
      setRespostas([]);
      setMostrarResposta(false);
    } catch (err) {
      setQuestions([]);
      setError(err?.message || "Não foi possível carregar as perguntas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const total = questions.length;
  const questao = questions[etapa] ?? null;
  const progresso = total > 0 ? Math.round((etapa / total) * 100) : 0;
  const pontuacao = useMemo(
    () => respostas.filter((r) => r.correta).length,
    [respostas]
  );

  function confirmar() {
    if (selecionada === null || !questao) return;

    const correta = selecionada === questao.correctIndex;
    setRespostas((prev) => [...prev, { idQuestao: questao.id, correta }]);
    setMostrarResposta(true);
  }

  function proxima() {
    setMostrarResposta(false);
    setSelecionada(null);
    setEtapa((prev) => prev + 1);
  }

  function reiniciar() {
    setEtapa(0);
    setSelecionada(null);
    setRespostas([]);
    setMostrarResposta(false);
  }

  if (loading) {
    return (
      <main className="tela">
        <section className="cartao">
          <h2 className="questao-quiz">Carregando perguntas via REST...</h2>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="tela">
        <section className="cartao">
          <h2 className="questao-quiz">{error}</h2>
          <div className="botoes">
            <button className="btn-reiniciar" onClick={loadQuestions}>
              Tentar novamente
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (total === 0) {
    return (
      <main className="tela">
        <section className="cartao">
          <h2 className="questao-quiz">Nenhuma pergunta cadastrada.</h2>
          <div className="botoes">
            <button className="btn-reiniciar" onClick={loadQuestions}>
              Atualizar lista
            </button>
          </div>
        </section>
      </main>
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
          <button className="btn-reiniciar" onClick={reiniciar}>
            Refazer quiz
          </button>
          <button className="btn-reiniciar" onClick={loadQuestions}>
            Buscar novas perguntas
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
          <div className="progresso-quiz" style={{ fontSize: 12, color: "#0f0" }}>
            REST conectado
          </div>
        </header>

        <h2 className="questao-quiz">{questao.text}</h2>

        <div className="opcoes">
          {questao.options.map((alt, idx) => {
            const estaSelecionada = selecionada === idx;
            const estaCorreta = mostrarResposta && idx === questao.correctIndex;
            const estaErrada =
              mostrarResposta && estaSelecionada && idx !== questao.correctIndex;

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
              onClick={confirmar}
            >
              Confirmar (REST)
            </button>
            <button className="btn-reiniciar" onClick={reiniciar}>
              Reiniciar
            </button>
          </div>
        ) : (
          <div className="feedback">
            {selecionada === questao.correctIndex ? (
              <h2 className="acerto">Parabéns, você acertou!</h2>
            ) : (
              <h2 className="erro">Você errou!</h2>
            )}
            <div className="explicacao-quiz">
              <p className="conteudo-feedback">{questao.explanation}</p>
            </div>
            <button className="btn-reiniciar" onClick={proxima}>
              Próxima pergunta
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
