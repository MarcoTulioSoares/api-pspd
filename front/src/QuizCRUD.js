import { useCallback, useEffect, useMemo, useState } from "react";
import "./QuizCRUD.css";

const REST_API_BASE = "http://localhost:8080/api";
const REST_QUIZ_ENDPOINT = `${REST_API_BASE}/pergunta`;
const GRPC_PREFIX = "/grpc";
const GRPC_QUIZ_ENDPOINT = `${GRPC_PREFIX}/quiz`;

function ensureOptionsArray(options = []) {
  const arr = Array.isArray(options) ? [...options] : [];
  while (arr.length < 4) arr.push("");
  return arr.slice(0, 4);
}

function normalizeQuestion(item) {
  if (!item) return null;
  const id = item.id ?? item.codigoPergunta ?? item.codigo_pergunta ?? null;
  const text = item.text ?? item.texto ?? item.pergunta ?? "";
  const rawOptions =
    item.options ??
    item.alternativas ??
    [item.q1, item.q2, item.q3, item.q4].filter((opt) => opt !== undefined && opt !== null);
  const options = ensureOptionsArray(rawOptions);
  const correctIndex =
    item.correctIndex ??
    item.indice_resposta ??
    item.indiceResposta ??
    0;
  const explanation = item.explanation ?? item.explicacao ?? "";
  return { id, text, options, correctIndex, explanation };
}

function toRestPayload(question) {
  const normalized = normalizeQuestion(question) || {
    id: null,
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  };
  return {
    codigoPergunta: normalized.id,
    pergunta: normalized.text,
    q1: normalized.options[0] ?? "",
    q2: normalized.options[1] ?? "",
    q3: normalized.options[2] ?? "",
    q4: normalized.options[3] ?? "",
    explicacao: normalized.explanation ?? "",
    indiceResposta: normalized.correctIndex ?? 0,
  };
}

function listEndpointFor(mode) {
  return mode === "rest" ? REST_QUIZ_ENDPOINT : GRPC_QUIZ_ENDPOINT;
}

function itemEndpointFor(mode, id) {
  return mode === "rest" ? `${REST_QUIZ_ENDPOINT}/${id}` : `${GRPC_QUIZ_ENDPOINT}/${id}`;
}
async function jsonFetch(url, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return data;
}


const DEMO_DATA = [
  {
    id: 1,
    text: "O que é gRPC?",
    options: ["Protocolo de roteamento", "Framework RPC", "Banco de dados", "Balanceador"],
    correctIndex: 1,
    explanation: "gRPC é um framework RPC de alto desempenho baseado em HTTP/2 e Protobuf.",
  },
  {
    id: 2,
    text: "Qual protocolo de transporte o gRPC usa por padrão?",
    options: ["HTTP/1.1", "WebSocket", "HTTP/2", "FTP"],
    correctIndex: 2,
    explanation: "gRPC usa HTTP/2 por padrão.",
  },
];


function ModeToggle({ mode, setMode }) {
  return (
    <div className="crud-toggle">
      <button
        type="button"
        className={mode === "rest" ? "crud-btn active" : "crud-btn"}
        onClick={() => setMode("rest")}
      >
        REST
      </button>
      <button
        type="button"
        className={mode === "grpc" ? "crud-btn active" : "crud-btn"}
        onClick={() => setMode("grpc")}
      >
        gRPC
      </button>
    </div>
  );
}


function QuestionForm({ value, onChange, onSubmit, onCancel, submitting, mode }) {
  const v = value;
  function set(field, val) { onChange({ ...v, [field]: val }); }
  function setOption(idx, val) {
    const opts = [...v.options];
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
            value={v.options[i]}
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
        onChange={(e) => set("correctIndex", Math.max(0, Math.min(3, Number(e.target.value))))}
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
          {submitting
            ? `Salvando (${mode === "rest" ? "REST" : "gRPC"})...`
            : `Salvar (${mode === "rest" ? "REST" : "gRPC"})`}
        </button>
        <button className="crud-btn outline" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}


export default function QuizCRUD() {
  const [mode, setMode] = useState("grpc");
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") || "" : "";

  const load = useCallback(async () => {
    setErr(""); setLoading(true);
    try {
      const data = await jsonFetch(listEndpointFor(mode), { token });
      const arr = Array.isArray(data) ? data : data?.items || [];
      const normalizados = arr
        .map((it) => normalizeQuestion(it))
        .filter((it) => it != null);
      setItems(normalizados);
    } catch {
      setItems(DEMO_DATA);
      setErr("(demo) usando dados locais, não consegui buscar no backend.");
    } finally { setLoading(false); }
  }, [mode, token]);

  async function createItem(payload) {
    try {
      const endpoint = listEndpointFor(mode);
      const body = mode === "rest" ? toRestPayload(payload) : payload;
      const created = await jsonFetch(endpoint, { method: "POST", body, token });
      const normalizado = normalizeQuestion(created);
      if (normalizado?.id != null) {
        return normalizado;
      }
      const fallback = normalizeQuestion(payload) || payload;
      const nextId = Math.max(0, ...items.map(i => i.id || 0)) + 1;
      return { ...fallback, id: nextId };
    } catch {
      const fallback = normalizeQuestion(payload) || payload;
      const nextId = Math.max(0, ...items.map(i => i.id || 0)) + 1;
      return { ...fallback, id: nextId };
    }
  }

  async function updateItem(id, payload) {
    try {
      const endpoint = itemEndpointFor(mode, id);
      const body = mode === "rest" ? toRestPayload({ ...payload, id }) : payload;
      await jsonFetch(endpoint, { method: "PUT", body, token });
    }
    catch {}
  }

  async function removeItem(id) {
    try {
      const endpoint = itemEndpointFor(mode, id);
      await jsonFetch(endpoint, { method: "DELETE", token });
    }
    catch {}
    finally { setItems(prev => prev.filter(i => i.id !== id)); }
  }

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter(it =>
      it.text?.toLowerCase().includes(query) ||
      it.explanation?.toLowerCase().includes(query) ||
      (it.options || []).some(o => o?.toLowerCase().includes(query))
    );
  }, [items, q]);

  function newEmpty() {
    setEditing({ id: null, text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" });
  }

  async function submitForm(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing.id == null) {
        const created = await createItem(editing);
        setItems(prev => [...prev, created]);
      } else {
        await updateItem(editing.id, editing);
        setItems(prev => prev.map(it => (it.id === editing.id ? { ...editing } : it)));
      }
      setEditing(null);
    } finally { setSubmitting(false); }
  }

  return (
    <div className="crud-wrap">
      <section className="crud-card">
        <header className="crud-head">
          <div>
            <h2 className="crud-title">CRUD de Quiz</h2>
            <p className="crud-subtle">Gerencie questões: criar, editar e excluir</p>
          </div>

          {!editing && (
            <div className="crud-actions-right">
              <ModeToggle mode={mode} setMode={setMode} />
              <button className="crud-btn primary" onClick={newEmpty}>+ Nova questão</button>
              <button className="crud-btn" onClick={load} disabled={loading}>
                {loading
                  ? `Atualizando (${mode === "rest" ? "REST" : "gRPC"})...`
                  : `Atualizar (${mode === "rest" ? "REST" : "gRPC"})`}
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
            mode={mode}
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
                  <tr><td colSpan={4} className="empty">Sem resultados.</td></tr>
                ) : (
                  filtered.map(it => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>
                        <div className="q-text">{it.text}</div>
                        <div className="q-options">
                          {it.options?.map((op, idx) => (
                            <span key={idx} className={`q-badge ${idx === it.correctIndex ? "ok" : ""}`}>
                              {String.fromCharCode(65 + idx)}. {op}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {typeof it.correctIndex === "number"
                          ? `Índice ${it.correctIndex} (${String.fromCharCode(65 + it.correctIndex)})`
                          : "-"}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="crud-btn" onClick={() => setEditing({ ...it })}>Editar</button>
                          <button className="crud-btn danger" onClick={() => removeItem(it.id)}>Excluir</button>
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
