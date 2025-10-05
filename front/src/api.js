const API_BASE_URL = "http://localhost:8089/api";

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || data?.error || text || "Erro ao comunicar com o servidor.";
    throw new Error(message);
  }

  return data;
}

function mapPerguntaDtoToModel(dto) {
  return {
    id: dto?.codigoPergunta ?? null,
    text: dto?.pergunta ?? "",
    options: [dto?.q1, dto?.q2, dto?.q3, dto?.q4].map((opt) => opt ?? ""),
    correctIndex: dto?.indiceResposta ?? 0,
    explanation: dto?.explicacao ?? "",
  };
}

function mapPerguntaModelToDto(model) {
  return {
    codigoPergunta: model?.id ?? null,
    pergunta: model?.text ?? "",
    q1: model?.options?.[0] ?? "",
    q2: model?.options?.[1] ?? "",
    q3: model?.options?.[2] ?? "",
    q4: model?.options?.[3] ?? "",
    explicacao: model?.explanation ?? "",
    indiceResposta: model?.correctIndex ?? 0,
  };
}

export const api = {
  login(email, senha) {
    return request("/usuario/login", { method: "POST", body: { email, senha } });
  },

  registrarUsuario(usuario) {
    return request("/usuario", { method: "POST", body: usuario });
  },

  listarUsuarios() {
    return request("/usuario");
  },

  listarPerguntas() {
    return request("/pergunta").then((items) =>
      Array.isArray(items) ? items.map(mapPerguntaDtoToModel) : []
    );
  },

  criarPergunta(model) {
    const payload = mapPerguntaModelToDto(model);
    return request("/pergunta", { method: "POST", body: payload }).then(mapPerguntaDtoToModel);
  },

  atualizarPergunta(id, model) {
    const payload = mapPerguntaModelToDto({ ...model, id });
    return request(`/pergunta/${id}`, { method: "PUT", body: payload }).then(mapPerguntaDtoToModel);
  },

  removerPergunta(id) {
    return request(`/pergunta/${id}`, { method: "DELETE" });
  },
};
