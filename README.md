# Abhishek Tiwari — Full Stack Developer Portfolio

Public Next.js portfolio with a separate FastAPI AI backend. The portfolio remains accessible without login. The assistant keeps chat only in browser memory; job analysis is processed asynchronously and its short-lived result is accessible only with the task token returned at submission.

## Architecture

```text
Next.js frontend (port 3000)
  ├── portfolio sections and chat UI
  └── calls FastAPI using NEXT_PUBLIC_FASTAPI_BASE_URL

FastAPI backend (port 8000)
  ├── POST /api/v1/chat → LangChain (Mistral primary, Groq fallback)
  ├── POST /api/v1/job-analysis → validate/extract → Celery task
  └── GET /api/v1/job-analysis/{task_id} → token-protected task status/result

Redis
  ├── Celery broker and short-lived result backend
  ├── shared API rate limits
  └── short-lived task access-token hashes
Celery worker → LangChain (Mistral primary, Groq fallback) job-fit report
```

The backend profile is maintained in `backend/app/data/portfolio_profile.py` and is based on the verified portfolio content. Chat requests do not use a queue. Uploaded files are validated and parsed in memory; the resulting job text is passed to Redis/Celery for task execution. There is no database, login, visitor tracking, analytics, or chat history.

## Requirements

- Node.js compatible with the installed Next.js 15 project
- Python 3.10+
- Docker Desktop with Compose (recommended for local Redis, API, and worker)
- A Mistral API key and/or a Groq API key

## Environment configuration

Add the frontend URL to your existing repository-root `.env`; do not replace an already populated `.env`. Copy `backend/.env.example` to `backend/.env` and put backend credentials there. Docker Compose reads that backend-only file, and direct Python services load it from the `backend` directory. The examples contain placeholders only. Never commit a populated environment file.

Required backend variables:

| Variable | Purpose |
| --- | --- |
| `MISTRAL_API_KEY` | Server-only Mistral credential (recommended primary provider) |
| `GROQ_API_KEY` | Server-only Groq credential (recommended fallback provider) |
| `AI_PRIMARY_PROVIDER` | `mistral` or `groq`; defaults to `mistral` |
| `AI_FALLBACK_PROVIDER` | `mistral` or `groq`; defaults to `groq` |
| `MISTRAL_MODEL` | Mistral model ID; defaults to `mistral-small-latest` |
| `GROQ_MODEL` | Groq model ID; defaults to `openai/gpt-oss-120b` |
| `AI_TIMEOUT_SECONDS` | Per-provider request timeout; defaults to 45 seconds |
| `REDIS_URL` | Redis rate-limit connection |
| `CELERY_BROKER_URL` | Celery queue connection; defaults to `REDIS_URL` |
| `CELERY_RESULT_BACKEND` | Short-lived Celery task state/result store |
| `CORS_ORIGINS` | Exact comma-separated frontend origins allowed by the API |
| `NEXT_PUBLIC_FASTAPI_BASE_URL` | Browser-visible API origin, e.g. `http://localhost:8000`; this is an address, not a secret |

Create API keys in the Mistral and/or Groq provider consoles and set them only in `backend/.env` (or the backend/worker deployment environment). The backend defaults to Mistral (`mistral-small-latest`) and falls back to Groq (`openai/gpt-oss-120b`). Both model names and provider order are configurable; use model IDs enabled for your provider account. If the primary key is missing but the configured fallback key exists, the service uses that fallback. Provider authentication errors do not trigger fallback. Never use a `NEXT_PUBLIC_` prefix for credentials. In deployment, set provider variables in both backend API and worker service environments, and the API URL in the frontend deployment settings.

## Local development

### Recommended: Docker Compose for Redis, API, and worker

1. Copy `backend/.env.example` to `backend/.env` and set at least one provider key. Set `NEXT_PUBLIC_FASTAPI_BASE_URL=http://localhost:8000` in the repository-root `.env` if it is not already configured.
2. Start the backend services from the repository root:

   ```bash
   docker compose up --build
   ```

3. In another terminal, start the frontend:

   ```bash
   npm install
   npm run dev
   ```

4. Visit `http://localhost:3000`. API health is at `http://localhost:8000/health`; interactive API docs are at `http://localhost:8000/docs`.

The Compose Redis service has no persistent volume and disables append-only persistence for local development. Production should use a private, authenticated/TLS Redis service with carefully chosen persistence, backup, network, and retention policies.

### Run backend processes directly

Start Redis separately, then in the `backend` directory:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

In another terminal, from `backend` with the same environment:

```bash
celery -A app.tasks.celery_app:celery_app worker --loglevel=INFO --concurrency=2
```

To run more workers, start additional worker processes with the same broker and an explicitly controlled concurrency. In Compose, set `CELERY_WORKER_CONCURRENCY` in `backend/.env`; the worker command reads that value. For example, two workers with concurrency two permit up to four active tasks, subject to provider quotas and host resources. More concurrency is not automatically faster and can trigger provider rate limits.

## API

- `GET /health` — verifies Redis connectivity; `GET /health/worker` — pings registered Celery workers.
- `POST /api/v1/chat` — JSON body `{ "messages": [{ "role": "user", "content": "..." }] }`; accepts up to six messages and a 500-character user message.
- `POST /api/v1/job-analysis` — multipart form containing exactly one `job_description` field or one `file` field (`.pdf` / `.docx`). Returns HTTP 202 with `task_id`, `access_token`, and `queued` status.
- `GET /api/v1/job-analysis/{task_id}` — send the returned token in `X-Analysis-Token`. Reports queued, processing, completed, or failed state. The task ID by itself does not authorize result access.

Upload size defaults to 5 MiB; extracted text is limited to 30,000 characters and PDFs to 100 pages. Document parsing checks extension, MIME when supplied, file signature, and readable contents. Uploaded file bytes are read in memory and the request file is closed. The job description itself is temporarily present in the broker message until consumed by a worker; it is not stored in an application database. The result and task access token expire after 24 hours by default.

## Limits and production considerations

Chat and analysis are rate-limited through Redis (10 and 3 requests per minute per direct peer address by default). If Redis is unavailable, these APIs fail closed. Do not trust arbitrary forwarded-IP headers: configure the ingress/reverse proxy to sanitize client address information and, if necessary, update the backend to read only that trusted header. CORS is restricted to `CORS_ORIGINS`.

Each AI request tries the configured primary provider once, then tries the fallback once only for a rate limit/quota response or a transient network/5xx error. SDK-level retries are disabled so fallback is prompt. Chat API keys stay server-side; the job analysis task retries only if both configured providers fail transiently, at most three times with exponential delays. Rate limits, authentication/configuration failures, malformed output, and validation errors are terminal for that task. Provider timeouts, worker soft/hard limits, upload size, token budgets, per-IP limits, and worker concurrency can be configured through the variables in `backend/.env.example`. Use `celery -A app.tasks.celery_app:celery_app inspect ping`, `inspect active`, and queue/Redis metrics to monitor workers and backlog.

This setup cannot promise that 100 recruiters will be processed simultaneously. Throughput depends on worker count/concurrency, Redis and host capacity, Mistral/Groq account quotas, and provider latency. Use the included load-test script gradually against a staging environment and monitor queue depth, worker health, Redis memory, provider limits, and error rates. The sample script submits requests but does not poll each report and should not be aimed at production without explicit quota/rate planning.

Because the initial service has no persistent database, task ownership relies on an unguessable bearer token whose hash is stored in Redis for the same short TTL as task results. Redis loss/eviction can make a live task/result unavailable; task IDs and results are not durable business records. For multi-region or higher-assurance ownership/durability, add a persistent task store only with an explicit retention and privacy design. Shared Redis rate limits are required across multiple API instances.

## Tests and checks

Backend tests use mocked Mistral/Groq and Celery calls; they do not require provider keys or paid AI calls:

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

Use `API_BASE_URL`, `TARGET_RPS`, and `MAX_VUS` to tune a controlled staging run. Submissions trigger real AI work, so use a low arrival rate and account for provider cost/quota.

## Project structure

```text
backend/
  app/api/routes/       Chat and job-analysis APIs
  app/core/             Server settings
  app/data/             Verified portfolio profile
  app/schemas/          Request and report validation
  app/services/         Shared LangChain AI service and PDF/DOCX extraction
  app/tasks/            Celery setup and analysis worker task
  tests/                Mocked backend tests
  loadtest/             k6 submission scenario
  Dockerfile
src/
  app/                  Next.js routes and global design tokens
  components/chat/      Existing chat UI, now using FastAPI
  components/job-fit/   Job analyzer form and report UI
  components/sections/  Portfolio sections including Job Fit
  lib/backend.ts        Frontend FastAPI URL and error helper
  types/                Shared frontend types
docker-compose.yml      Local Redis, API and Celery worker
```
