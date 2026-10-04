/*
 * Earth & Orbit — protótipo acadêmico para mongosh.
 * TODOS os dados, rotas, observações e resultados são fictícios.
 * Este script demonstra MongoDB; não executa IA nem prevê reentradas.
 * Cria cinco coleções, insere dez documentos em cada uma e demonstra CRUD.
 * Cada DELETE remove somente um documento extra criado para demonstração.
 * Execute em um banco novo. Não há dropDatabase, drop ou limpeza automática.
 * No Docker Compose, roda sozinho na primeira criação do volume
 * (/docker-entrypoint-initdb.d). O nome do banco vem de MONGO_DB (padrão abaixo).
 */
// 1. Dados sintéticos. IDs em string facilitam a leitura no relatório.
const nomeBanco = (typeof process !== "undefined" && process.env && process.env.MONGO_DB) || "earth_orbit_academico";
const instante = new Date("2026-09-07T12:00:00Z");
const data = (hora) => new Date(`2026-09-08T${String(hora).padStart(2, "0")}:00:00Z`);
const id = (prefixo, numero) => prefixo + String(numero).padStart(3, "0");
const dez = (gerar) => Array.from({ length: 10 }, (_, i) => gerar(i + 1));
const base = (prefixo, numero) => ({
  _id: id(prefixo, numero), simulado: true, criadoEm: instante
});
const retangulo = (oeste, sul, largura = 1, altura = 1) => ({
  type: "Polygon",
  coordinates: [[
    [oeste, sul], [oeste + largura, sul],
    [oeste + largura, sul + altura], [oeste, sul + altura], [oeste, sul]
  ]]
});
const dados = {
  usuarios: dez((n) => ({
    ...base("USR", n), nome: `Perfil fictício ${n}`,
    email: `perfil${n}@example.com`, versao: n <= 5 ? "earth" : "orbit",
    ativo: true,
    ...(n <= 5
      ? { perfilAcademico: { instituicao: `Instituição fictícia ${n}`, finalidade: "pesquisa" } }
      : { organizacao: { nome: `Empresa fictícia ${n}`, setor: n % 2 === 0 ? "aviacao" : "maritimo" },
          acessoApi: { habilitado: true, limiteRequisicoesDia: 1000 } })
  })),
  objetos_espaciais: dez((n) => ({
    ...base("OBJ", n), nome: `Objeto sintético ${n}`,
    tipo: n % 2 === 0 ? "estagio_foguete" : "fragmento",
    status: "catalogado", origemDados: "catalogo_sintetico_academico",
    ...(n % 2 === 0
      ? { massaEstimadaKg: 500 + n * 10, materialPredominante: "aluminio" }
      : { tamanhoEstimadoM: n / 10, objetoOrigemDescricao: "Objeto de origem fictício" })
  })),
  observacoes: dez((n) => ({
    ...base("OBS", n), objetoId: id("OBJ", n), observadoEm: instante,
    fonte: { nome: `Fonte fictícia ${n}`, tipo: n % 2 === 0 ? "radar_simulado" : "optico_simulado" },
    revisado: false, orbita: { altitudeKm: 240 + n * 5, inclinacaoGraus: 50 + n },
    ...(n % 2 === 0
      ? { medicaoRadar: { distanciaKm: 700 + n, incertezaDistanciaKm: 2 } }
      : { medicaoOptica: { magnitudeAparente: 8 + n / 10, incertezaAngularSegArco: 3 } })
  })),
  monitoramentos: dez((n) => ({
    ...base("MON", n), usuarioId: id("USR", n), nome: `Monitoramento fictício ${n}`,
    tipo: n <= 5 ? "regiao" : n % 2 === 0 ? "rota_aerea" : "rota_maritima",
    ativo: true, janela: { inicio: data(10), fim: data(16) },
    // GeoJSON usa [longitude, latitude]. As formas são somente ilustrativas.
    geometria: n <= 5 ? retangulo(-50 + n, -25) : {
      type: "LineString", coordinates: [[-50 + n, -25], [-49 + n, -23]]
    },
    ...(n <= 5
      ? { finalidade: "pesquisa_academica" }
      : n % 2 === 0
        ? { transporte: { codigo: `VOO-FICTICIO-${n}`, altitudeCruzeiroM: 11000 } }
        : { transporte: { codigo: `NAVIO-FICTICIO-${n}`, velocidadeNos: 15 } })
  })),
  analises_risco: dez((n) => ({
    ...base("ANA", n), objetoId: id("OBJ", n), observacaoIds: [id("OBS", n)],
    monitoramentoId: id("MON", n), geradaEm: instante,
    metodo: { nome: "cenario_sintetico_sem_calculo_fisico", versao: "1.0" },
    janelaReentradaIlustrativa: { inicio: data(11), fim: data(15) },
    areaIlustrativa: retangulo(-50 + n, -25, 1.5, 1.5),
    resultado: {
      prioridadeSimulada: ["baixa", "media", "alta"][(n - 1) % 3],
      probabilidadeImpacto: null,
      justificativa: "Prioridade atribuída ao cenário didático; probabilidade não calculada."
    },
    alerta: { status: "pendente", canalPrevisto: n <= 5 ? "painel_earth" : "api_orbit" },
    revisao: { status: "pendente" }
  }))
};
// 2. MongoDB. Pare se o banco já contiver qualquer coleção.
const banco = db.getSiblingDB(nomeBanco);
if (banco.getCollectionNames().length > 0) {
  throw new Error(`O banco ${nomeBanco} já contém coleções. Escolha outro nome de banco.`);
}
function conferir(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem);
}
function mostrar(titulo, valor) {
  print("\n" + titulo);
  printjson(valor);
}
function ler(colecao, filtro) {
  mostrar(`READ — ${colecao}`, banco.getCollection(colecao).find(filtro).toArray());
}
function mostrarUpdate(colecao, resultado) {
  mostrar(`UPDATE — ${colecao}`, resultado);
  conferir(resultado.matchedCount === 1 && resultado.modifiedCount === 1,
    `UPDATE não alterou exatamente um documento de ${colecao}.`);
}
// 3. Criação explícita das cinco coleções.
mostrar("CREATE COLLECTION — usuarios", banco.createCollection("usuarios"));
mostrar("CREATE COLLECTION — objetos_espaciais", banco.createCollection("objetos_espaciais"));
mostrar("CREATE COLLECTION — observacoes", banco.createCollection("observacoes"));
mostrar("CREATE COLLECTION — monitoramentos", banco.createCollection("monitoramentos"));
mostrar("CREATE COLLECTION — analises_risco", banco.createCollection("analises_risco"));
mostrar("Coleções criadas", banco.getCollectionNames());
// Índices de consulta, unicidade de e-mail e geometria na superfície terrestre.
banco.usuarios.createIndex({ email: 1 }, { unique: true });
banco.observacoes.createIndex({ objetoId: 1, observadoEm: -1 });
banco.monitoramentos.createIndex({ usuarioId: 1, ativo: 1 });
banco.monitoramentos.createIndex({ geometria: "2dsphere" });
banco.analises_risco.createIndex({ monitoramentoId: 1, geradaEm: -1 });
banco.analises_risco.createIndex({ areaIlustrativa: "2dsphere" });
// 4. CREATE: dez documentos permanentes em cada coleção.
mostrar("INSERT MANY — usuarios", banco.usuarios.insertMany(dados.usuarios));
mostrar("INSERT MANY — objetos_espaciais", banco.objetos_espaciais.insertMany(dados.objetos_espaciais));
mostrar("INSERT MANY — observacoes", banco.observacoes.insertMany(dados.observacoes));
mostrar("INSERT MANY — monitoramentos", banco.monitoramentos.insertMany(dados.monitoramentos));
mostrar("INSERT MANY — analises_risco", banco.analises_risco.insertMany(dados.analises_risco));
// 5. READ: filtros que representam consultas do aplicativo.
ler("usuarios", { versao: "orbit" });
ler("objetos_espaciais", { tipo: "estagio_foguete" });
ler("observacoes", { objetoId: "OBJ001" });
ler("monitoramentos", { tipo: "rota_aerea", ativo: true });
ler("analises_risco", { "resultado.prioridadeSimulada": "alta" });
// 6. UPDATE: alterar um campo funcional em cada coleção e confirmar a leitura.
mostrarUpdate("usuarios", banco.usuarios.updateOne(
  { _id: "USR001" }, { $set: { nome: "Perfil fictício 1 atualizado", atualizadoEm: instante } }
));
mostrarUpdate("objetos_espaciais", banco.objetos_espaciais.updateOne(
  { _id: "OBJ001" }, { $set: { status: "em_monitoramento", atualizadoEm: instante } }
));
mostrarUpdate("observacoes", banco.observacoes.updateOne(
  { _id: "OBS001" }, { $set: { revisado: true, atualizadoEm: instante } }
));
mostrarUpdate("monitoramentos", banco.monitoramentos.updateOne(
  { _id: "MON001" }, { $set: { nome: "Região de pesquisa atualizada", atualizadoEm: instante } }
));
mostrarUpdate("analises_risco", banco.analises_risco.updateOne(
  { _id: "ANA001" }, { $set: {
    "revisao.status": "revisado_em_demonstracao", "revisao.revisadoEm": instante
  } }
));
ler("usuarios", { _id: "USR001" });
ler("objetos_espaciais", { _id: "OBJ001" });
ler("observacoes", { _id: "OBS001" });
ler("monitoramentos", { _id: "MON001" });
ler("analises_risco", { _id: "ANA001" });
// 7. CREATE + DELETE: insere o 11º registro e o exclui, mantendo os dez exigidos.
mostrar("INSERT TEMP — usuarios", banco.usuarios.insertOne({
  ...dados.usuarios[0], _id: "USR_TEMP", email: "temporario@example.com", temporarioCrud: true
}));
mostrar("INSERT TEMP — objetos_espaciais", banco.objetos_espaciais.insertOne({
  ...dados.objetos_espaciais[0], _id: "OBJ_TEMP", temporarioCrud: true
}));
mostrar("INSERT TEMP — observacoes", banco.observacoes.insertOne({
  ...dados.observacoes[0], _id: "OBS_TEMP", temporarioCrud: true
}));
mostrar("INSERT TEMP — monitoramentos", banco.monitoramentos.insertOne({
  ...dados.monitoramentos[0], _id: "MON_TEMP", temporarioCrud: true
}));
mostrar("INSERT TEMP — analises_risco", banco.analises_risco.insertOne({
  ...dados.analises_risco[0], _id: "ANA_TEMP", temporarioCrud: true
}));
for (const nome of Object.keys(dados)) {
  conferir(banco.getCollection(nome).countDocuments({}) === 11, `${nome}: esperados 11 antes do DELETE.`);
  ler(nome, { temporarioCrud: true });
}
const exclusoes = {
  usuarios: banco.usuarios.deleteOne({ _id: "USR_TEMP", temporarioCrud: true }),
  objetos_espaciais: banco.objetos_espaciais.deleteOne({ _id: "OBJ_TEMP", temporarioCrud: true }),
  observacoes: banco.observacoes.deleteOne({ _id: "OBS_TEMP", temporarioCrud: true }),
  monitoramentos: banco.monitoramentos.deleteOne({ _id: "MON_TEMP", temporarioCrud: true }),
  analises_risco: banco.analises_risco.deleteOne({ _id: "ANA_TEMP", temporarioCrud: true })
};
for (const [nome, resultado] of Object.entries(exclusoes)) {
  mostrar(`DELETE — ${nome}`, resultado);
  conferir(resultado.deletedCount === 1, `DELETE de ${nome} não removeu exatamente um documento.`);
  ler(nome, { temporarioCrud: true }); // Esperado: [] após a exclusão.
}
// 8. Flexibilidade: documentos Earth/Orbit e região/rota na mesma coleção.
ler("usuarios", { _id: { $in: ["USR001", "USR006"] } });
ler("monitoramentos", { _id: { $in: ["MON001", "MON006", "MON007"] } });
// 9. Consulta adicional: triagem geométrica e temporal de cenários simulados.
const alvo = banco.monitoramentos.findOne({ _id: "MON006" });
ler("analises_risco", {
  areaIlustrativa: { $geoIntersects: { $geometry: alvo.geometria } },
  "janelaReentradaIlustrativa.inicio": { $lte: alvo.janela.fim },
  "janelaReentradaIlustrativa.fim": { $gte: alvo.janela.inicio }
});
// 10. Verificações finais de quantidade e referências (sem integridade automática).
for (const nome of Object.keys(dados)) {
  const total = banco.getCollection(nome).countDocuments({});
  mostrar(`CONTAGEM FINAL — ${nome}`, total);
  conferir(total === 10, `${nome}: esperados dez documentos finais.`);
}
for (const obs of banco.observacoes.find({}).toArray()) {
  conferir(banco.objetos_espaciais.countDocuments({ _id: obs.objetoId }) === 1, "Objeto da observação ausente.");
}
for (const mon of banco.monitoramentos.find({}).toArray()) {
  conferir(banco.usuarios.countDocuments({ _id: mon.usuarioId }) === 1, "Usuário do monitoramento ausente.");
}
for (const analise of banco.analises_risco.find({}).toArray()) {
  conferir(banco.objetos_espaciais.countDocuments({ _id: analise.objetoId }) === 1, "Objeto da análise ausente.");
  conferir(banco.monitoramentos.countDocuments({ _id: analise.monitoramentoId }) === 1, "Monitoramento da análise ausente.");
  for (const obsId of analise.observacaoIds) {
    conferir(banco.observacoes.countDocuments({ _id: obsId, objetoId: analise.objetoId }) === 1,
      "Observação ausente ou associada a outro objeto.");
  }
}
print("\nConcluído: cinco coleções, dez documentos em cada uma e CRUD demonstrado.");
print("Todos os resultados são acadêmicos e simulados. Nenhum alerta externo foi enviado.");
