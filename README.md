# Abhishek Tiwari — Full Stack Developer Portfolio

Public Next.js portfolio with a separate FastAPI AI backend. The portfolio is accessible without login. The AI Portfolio Assistant keeps chat in browser memory, and the Job Fit Analyzer processes each submission directly in FastAPI. Neither feature stores conversations or job descriptions in an application database.

## Architecture

```text
Next.js frontend (port 3000)
  └── Calls FastAPI using NEXT_PUBLIC_FASTAPI_BASE_URL

FastAPI backend (port 8000)
  ├── POST /api/v1/chat → LangChain (configured Mistral/Groq order)
  └── POST /api/v1/job-analysis → validate/extract → Gemini → Groq → Mistral → report response

Redis
  └── Shared API rate limits for chat and job analysis
```

The backend profile is maintained in `backend/app/data/portfolio_profile.py` and is based on verified portfolio content. Uploaded documents are validated and parsed in memory. Redis is used for shared rate limits only; analysis results are returned in the request response and are not retained by the application.

## Requirements

- Node.js compatible with the installed Next.js 15 project
- Python 3.10+
- Docker Desktop with Compose (recommended for local Redis and API)
- A Gemini, Groq, and/or Mistral API key (Gemini is the Job Fit Analyzer primary)

## Environment configuration

Add `NEXT_PUBLIC_FASTAPI_BASE_URL=http://localhost:8000` to the repository-root `.env` if it is not already set. Copy `backend/.env.example` to `backend/.env` and place backend credentials there. Docker Compose reads that backend-only file; direct Python services load it when started from the `backend` directory. The example contains placeholders only. Never commit populated environment files.

| Variable | Purpose |
| --- | --- |
| `MISTRAL_API_KEY` | Server-only Mistral credential |
| `GROQ_API_KEY` | Server-only Groq credential |
| `GEMINI_API_KEY` | Server-only Google Gemini credential |
| `AI_PRIMARY_PROVIDER` | `mistral` or `groq`; defaults to `mistral` |
| `AI_FALLBACK_PROVIDER` | `mistral` or `groq`; defaults to `groq` |
| `MISTRAL_MODEL` | Mistral model ID; defaults to `mistral-small-latest` |
| `GROQ_MODEL` | Groq model ID; defaults to `openai/gpt-oss-120b` |
| `GEMINI_MODEL` | Gemini model ID; defaults to `gemini-3.8-flash` |
| `JOB_ANALYSIS_PROVIDER_ORDER` | Ordered unique provider list; defaults to `gemini,groq,mistral` |
| `AI_TIMEOUT_SECONDS` | Per-provider request timeout; defaults to 45 seconds |
| `REDIS_URL` | Redis connection used for shared rate limits |
| `CHAT_LIMIT_PER_MINUTE` | Chat requests allowed per client per minute |
| `JOB_ANALYSIS_LIMIT_PER_MINUTE` | Job analyses allowed per client per minute |
| `CORS_ORIGINS` | Exact comma-separated frontend origins allowed by the API |
| `NEXT_PUBLIC_FASTAPI_BASE_URL` | Browser-visible backend address; not a secret |

The chatbot retains its existing Mistral/Groq provider configuration (`AI_PRIMARY_PROVIDER`, `AI_FALLBACK_PROVIDER`). Job Fit Analysis uses its separate `JOB_ANALYSIS_PROVIDER_ORDER`, defaulting to Gemini (`gemini-3.8-flash`), Groq (`openai/gpt-oss-120b`), then Mistral (`mistral-small-latest`). Configure model IDs enabled for each provider account. An unconfigured provider is skipped; a provider-specific error is logged safely and the service tries the next provider once. The first schema-valid report is returned. Never use a `NEXT_PUBLIC_` prefix for credentials.

For Render, configure `GEMINI_API_KEY`, `GEMINI_MODEL`, `JOB_ANALYSIS_PROVIDER_ORDER`, `GROQ_API_KEY`, `GROQ_MODEL`, `MISTRAL_API_KEY`, `MISTRAL_MODEL`, `AI_TIMEOUT_SECONDS`, and the existing Redis/CORS/rate-limit settings in the backend service environment. Set secrets in Render's environment configuration only; do not add them to the frontend or commit them.

## Local development

### Docker Compose

1. Copy `backend/.env.example` to `backend/.env` and set at least one provider key. Set `NEXT_PUBLIC_FASTAPI_BASE_URL=http://localhost:8000` in the repository-root `.env` if needed.
2. Start Redis and the API from the repository root:

   ```bash
   docker compose up --build
   ```

3. In another terminal, start the frontend:

   ```bash
   npm install
   npm run dev
   ```

4. Visit `http://localhost:3000`. API health is at `http://localhost:8000/health`; interactive API docs are at `http://localhost:8000/docs`.

The local Compose Redis service has no persistent volume and disables append-only persistence. Production should use a private Redis service with suitable authentication/TLS, network, memory, and retention policies.

### Run backend directly

Start Redis separately, then in the `backend` directory:

```bash
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

No worker process is needed. The API performs a job analysis during the POST request.

## API

- `GET /health` — verifies Redis connectivity.
- `POST /api/v1/chat` — JSON body `{ "messages": [{ "role": "user", "content": "..." }] }`; accepts up to six messages and a 500-character user message.
- `POST /api/v1/job-analysis` — multipart form containing exactly one `job_description` field or one `file` field (`.pdf` / `.docx`). The response is the completed `JobFitReport` JSON object; the request remains open while providers are tried.

Upload size defaults to 5 MiB; extracted text is limited to 30,000 characters and PDFs to 100 pages. Document parsing checks extension, MIME when supplied, file signature, and readable contents. Uploaded bytes are read in memory and the request file is closed. Results and job descriptions are not stored by the application. A client disconnect or server restart interrupts the request; the recruiter must submit again.

## Limits and deployment considerations

Chat and analysis use Redis-backed rate limits (10 and 3 requests per minute per direct peer address by default). Limits are shared across API instances using the same Redis. If Redis is unavailable, these APIs fail closed. Do not trust arbitrary forwarded-IP headers: configure the ingress/reverse proxy to sanitize client address information. CORS is restricted to `CORS_ORIGINS`.

Chat retains its configured primary/fallback behavior. Job analysis tries each configured provider at most once in the Gemini → Groq → Mistral order, with provider SDK retries disabled/bounded so a quota failure does not trigger a long hidden retry loop. Missing keys are skipped; provider failures and invalid report output allow a single move to the next configured provider. The API returns a report only after Pydantic validation. A job analysis can take up to roughly three times the provider timeout plus overhead. The direct API returns a timeout or provider failure as a safe HTTP error; there is no durable queue, retry-after-restart behavior, or stored result retrieval. Frontend and hosting request timeouts must allow for the configured provider timeouts. Throughput depends on API instance capacity and provider quotas/latency; Redis limits reduce abuse but do not guarantee provider availability.

For multi-instance deployments, point all API instances at the same reliable Redis service. The included load test causes real provider calls, so run it gradually against staging with a low request rate and account for provider quotas/costs.

## Tests and checks

Backend tests mock provider calls and do not require provider keys or paid AI requests:

```bash
cd backend
pip install -r requirements.txt
pytest -q
```

Frontend checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Load-test example (install k6 separately):

```bash
k6 run backend/loadtest/job_analysis.js
```

Use `API_BASE_URL`, `TARGET_RPS`, and `MAX_VUS` to tune a controlled staging run. Each accepted submission invokes AI synchronously, so use low rates.

## Project structure

```text
backend/
  app/api/routes/       Chat and direct job-analysis APIs
  app/core/             Server settings
  app/data/             Verified portfolio profile
  app/schemas/          Request and report validation
  app/services/         Shared LangChain AI service and PDF/DOCX extraction
  tests/                Mocked backend tests
  loadtest/             k6 submission scenario
  Dockerfile
src/
  app/                  Next.js routes and global design tokens
  components/chat/      Chat UI calling FastAPI
  components/job-fit/   Job analyzer form and report UI
  components/sections/  Portfolio sections including Job Fit
  lib/backend.ts        Frontend FastAPI URL and error helper
  types/                Shared frontend types
docker-compose.yml      Local Redis and API
```
