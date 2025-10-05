import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import "./Ranking.css";

function positionDecor(pos) {
  if (pos === 1) return { icon: "🏆", cls: "gold" };
  if (pos === 2) return { icon: "🥈", cls: "silver" };
  if (pos === 3) return { icon: "🥉", cls: "bronze" };
  return { icon: `#${pos}`, cls: "normal" };
}

function PositionBadge({ pos }) {
  const { icon, cls } = positionDecor(pos);
  return <span className={`pos-badge ${cls}`}>{icon}</span>;
}

export default function Ranking() {
  const [usuarios, setUsuarios] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      setErro("");
      try {
        const data = await api.listarUsuarios();
        const normalizados = Array.isArray(data)
          ? data.map((u) => ({
              user: u?.email || "Usuário",
              score: u?.pontuacao ?? 0,
            }))
          : [];
        setUsuarios(normalizados);
      } catch (e) {
        setErro(e.message || "Não foi possível carregar o ranking.");
        setUsuarios([]);
      }
    }

    carregar();
  }, []);

  const rows = useMemo(
    () =>
      [...usuarios]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 10)
        .map((r, i) => ({ ...r, pos: i + 1 })),
    [usuarios]
  );

  return (
    <div className="rk-wrap">
      <section className="rk-card">
        <header className="rk-head">
          <h2 className="rk-title">Ranking • Top 10</h2>
        </header>

        {erro && <div className="rk-error">{erro}</div>}

        <div className="rk-table-wrap scrollable">
          <table className="rk-table compact">
            
            <colgroup>
              <col className="col-pos" />
              <col className="col-user" />
              <col className="col-score" />
            </colgroup>

            <thead>
              <tr>
                <th>Posição</th>
                <th>Usuário</th>
                <th>Pontuação</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.user}>
                  <td className="cell-pos">
                    <PositionBadge pos={r.pos} />
                  </td>
                  <td className="cell-user">
                    <span className="rk-name">{r.user}</span>
                  </td>
                  <td className="cell-score">
                    <span className="rk-score">{r.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
