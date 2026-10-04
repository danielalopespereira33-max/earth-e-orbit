# Projeto - Cidades ESG Inteligentes

**Earth e Orbit** — plataforma acadêmica (FIAP) para organizar informações sobre detritos espaciais e relacioná-las a regiões e rotas de interesse.
API Java Spring Boot + MongoDB, containerizada com Docker e entregue por pipeline CI/CD no GitHub Actions (staging e production).

Integrantes: RM563474 Lucas Amancio Patti · RM562731 Daniela Cristina · RM564587 Joshuah Alves Nylander

> Os dados são **sintéticos**. A aplicação não calcula reentrada real nem envia alertas externos.

## Como executar localmente com Docker

Pré-requisitos: Docker Desktop (com Compose).

```bash
cp .env.example .env          # Windows: copy .env.example .env
docker compose up --build -d
docker compose ps
curl http://localhost:8080/api/health
curl http://localhost:8080/api/objetos
```

Na primeira subida, o MongoDB carrega `scripts/earth_orbit_mongodb.js` (5 coleções, 10 documentos cada).
Para recarregar do zero: `docker compose down -v` e suba novamente.

Endpoints:

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/health | Saúde da aplicação |
| GET | /api/usuarios | Listagem de perfis |
| GET | /api/objetos | Listagem de objetos espaciais |
| GET | /api/objetos/{id} | Consulta de um objeto |
| GET | /api/monitoramentos | Listagem de monitoramentos |
| GET | /api/analises-risco | Listagem de análises |
| POST | /api/monitoramentos | Cadastro com validação |

Exemplo de POST:

```bash
curl -X POST http://localhost:8080/api/monitoramentos -H "Content-Type: application/json" \
  -d '{"usuarioId":"USR001","nome":"Regiao teste","tipo":"regiao","inicio":"2026-09-08T10:00:00Z","fim":"2026-09-08T16:00:00Z"}'
```

Testes: `mvn clean test` (Java 21).

## Pipeline CI/CD

Ferramenta: **GitHub Actions** (`.github/workflows/ci-cd.yml`).

| Job | O que faz | Quando |
|---|---|---|
| test | `mvn clean verify` (build + testes JUnit) e gera o JAR | PR e push |
| docker | Build da imagem e push para o GHCR (tag = commit e `latest`) | push na `main` |
| staging | Copia os arquivos de deploy por SSH, sobe com Compose (porta 8081) e testa `/api/health` | após docker |
| production | Mesmo fluxo na porta 8082, após staging; Environment com aprovação manual | após staging |

### Configuração necessária no GitHub
Secrets do repositório (Settings > Secrets and variables > Actions):
- `DEPLOY_HOST`: IP ou DNS do servidor
- `DEPLOY_USER`: usuário SSH
- `DEPLOY_SSH_KEY`: chave privada SSH (conteúdo completo)

Environments: `staging` e `production` (em `production`, ative *Required reviewers*).
Settings > Actions > General > Workflow permissions: *Read and write permissions*.
O servidor precisa de Docker + Compose e das portas 22, 8081 e 8082 liberadas.

## Containerização

Dockerfile em duas etapas (build com Maven + Java 21; runtime com Java 21 JRE, usuário sem privilégios):

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --no-create-home appuser
COPY --from=build /app/target/earth-e-orbit.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Estratégias: cache de dependências Maven em camada própria, imagem final enxuta, rede Docker dedicada, volume `mongo_data` para persistência, variáveis de ambiente (`.env.example`) e ambientes isolados por projeto Compose (`deploy/`).

## Prints do funcionamento

Evidências reais em `docs/evidencias/`:

1. GitHub Actions com test, docker, staging e production concluídos
2. Testes com `BUILD SUCCESS`
3. Imagem `earth-e-orbit` no GHCR
4. `GET /api/health` em staging (porta 8081)
5. `GET /api/health` em production (porta 8082)

_(inserir as capturas reais aqui antes da entrega)_

## Tecnologias utilizadas

Java 21 · Spring Boot 3.5.6 (Web, Validation, Data MongoDB) · MongoDB 8 · JUnit 5 · Mockito · Maven · Docker e Docker Compose · GitHub Actions · GitHub Container Registry (GHCR)

## Checklist de entrega

| Item | OK |
|---|---|
| Projeto compactado em .ZIP com estrutura organizada | ☐ |
| Dockerfile funcional | ☐ |
| docker-compose.yml ou arquivos Kubernetes | ☐ |
| Pipeline com etapas de build, teste e deploy | ☐ |
| README.md com instruções e prints | ☐ |
| Documentação técnica com evidências (PDF ou PPT) | ☐ |
| Deploy realizado nos ambientes staging e produção | ☐ |
