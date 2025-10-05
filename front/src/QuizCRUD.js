import { useEffect, useMemo, useState } from "react";
import "./QuizCRUD.css";
import { api } from "./api";

const EMPTY_QUESTION = {
  id: null,
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
};

function QuestionForm({ value, onChange, onSubmit, onCancel, submitting }) {
  const v = value || EMPTY_QUESTION;
  const options = v.options || ["", "", "", ""];

  function set(field, val) {
    onChange({ ...v, [field]: val });
  }

  function setOption(idx, val) {
    const opts = [...options];
    opts[idx] = val;
    onChange({ ...v, options: opts });
  }

  return (
    <form className="crud-form" onSubmit={onSubmit}>
      <label className="crud-label">Texto da questão</label>
      <textarea
        className="crud-input"
        rows={3}
        value={v.text}
        onChange={(e) => set("text", e.target.value)}
        placeholder="Digite o enunciado da questão"
        required
      />

      {["A", "B", "C", "D"].map((letra, i) => (
        <div key={i}>
          <label className="crud-label">Alternativa {letra}</label>
          <input
            className="crud-input"
            value={options[i] || ""}
            onChange={(e) => setOption(i, e.target.value)}
            required
          />
        </div>
      ))}

      <label className="crud-label">Índice da correta (0-3)</label>
      <input
        className="crud-input"
        type="number"
        min={0}
        max={3}
        value={v.correctIndex}
        onChange={(e) =>
          set("correctIndex", Math.max(0, Math.min(3, Number(e.target.value))))
        }
      />

      <label className="crud-label">Explicação</label>
      <input
        className="crud-input"
        value={v.explanation}
        onChange={(e) => set("explanation", e.target.value)}
        placeholder="Por que essa alternativa está correta?"
      />

      <div className="crud-actions">
        <button className="crud-btn primary" disabled={submitting} type="submit">
          {submitting ? "Salvando (REST)..." : "Salvar (REST)"}
        </button>
        <button className="crud-btn outline" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function QuizCRUD() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await api.listarPerguntas();
      const arr = Array.isArray(data) ? data : [];
      setItems(arr);
    } catch (error) {
      setItems([]);
      setErr(error?.message || "Não foi possível carregar as perguntas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((it) =>
      it.text?.toLowerCase().includes(query) ||
      it.explanation?.toLowerCase().includes(query) ||
      (it.options || []).some((o) => o?.toLowerCase().includes(query))
    );
  }, [items, q]);

  function startCreate() {
    setEditing({ ...EMPTY_QUESTION });
  }

  function startEdit(item) {
    setEditing({ ...item, options: [...(item.options || ["", "", "", ""])] });
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setErr("");

    try {
      if (editing.id == null) {
        const created = await api.criarPergunta(editing);
        setItems((prev) => [...prev, created]);
      } else {
        const updated = await api.atualizarPergunta(editing.id, editing);
        setItems((prev) =>
          prev.map((it) => (it.id === updated.id ? updated : it))
        );
      }
      setEditing(null);
    } catch (error) {
      setErr(error?.message || "Erro ao salvar a pergunta.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeItem(id) {
    if (!window.confirm("Deseja excluir esta pergunta?")) {
      return;
    }
    setErr("");
    try {
      await api.removerPergunta(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (error) {
      setErr(error?.message || "Não foi possível excluir a pergunta.");
    }
  }

  return (
    <div className="crud-wrap">
      <section className="crud-card">
        <header className="crud-head">
          <div>
            <h2 className="crud-title">CRUD de Quiz</h2>
            <p className="crud-subtle">
              Integração REST ativa. A opção gRPC permanece indisponível.
            </p>
          </div>

          {!editing && (
            <div className="crud-actions-right">
              <button className="crud-btn primary" onClick={startCreate}>
                + Nova questão
              </button>
              <button className="crud-btn" onClick={load} disabled={loading}>
                {loading ? "Atualizando (REST)..." : "Atualizar (REST)"}
              </button>
            </div>
          )}
        </header>

        {!editing && (
          <div className="crud-searchbar">
            <input
              className="crud-input"
              placeholder="Buscar por texto, opção ou explicação..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        )}

        {err && <div className="crud-msg err">{err}</div>}

        {editing ? (
          <QuestionForm
            value={editing}
            onChange={setEditing}
            onSubmit={submitForm}
            onCancel={() => setEditing(null)}
            submitting={submitting}
          />
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>ID</th>
                  <th>Questão</th>
                  <th style={{ width: 180 }}>Correta</th>
                  <th style={{ width: 220 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">
                      {loading
                        ? "Carregando perguntas..."
                        : "Sem resultados."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((it) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>
                        <div className="q-text">{it.text}</div>
                        <div className="q-options">
                          {it.options?.map((op, idx) => (
                            <span
                              key={idx}
                              className={`q-badge ${
                                idx === it.correctIndex ? "ok" : ""
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}. {op}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {typeof it.correctIndex === "number"
                          ? `Índice ${it.correctIndex} (${String.fromCharCode(
                              65 + it.correctIndex
                            )})`
                          : "-"}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="crud-btn" onClick={() => startEdit(it)}>
                            Editar
                          </button>
                          <button
                            className="crud-btn danger"
                            onClick={() => removeItem(it.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
