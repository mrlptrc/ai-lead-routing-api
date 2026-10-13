# AI Lead Routing API

**An AI-assisted lead intake and routing service built with Fastify, Supabase, and n8n.**

The API accepts incoming inquiries, classifies each as sales, support, or other, stores it in Supabase, and routes it through n8n to the matching Google Sheets tab. The workflow can be adapted to different lead sources and destinations.

![TypeScript](https://img.shields.io/badge/TypeScript-111111?style=flat-square&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-111111?style=flat-square&logo=fastify&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-111111?style=flat-square&logo=supabase&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-111111?style=flat-square&logo=n8n&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-111111?style=flat-square&logo=docker&logoColor=white)

## How it works

```text
Lead source
    │
    ▼
n8n webhook ── validate and normalize the payload
    │
    ▼
Fastify API ── classify intent with OpenAI or Anthropic
    │            └─ use keyword classification as a fallback
    ▼
Supabase / PostgreSQL
    │
    ▼
n8n ── route to Sales, Support, or Other in Google Sheets
```

## Features

- Lead intake with name and message validation
- Intent classification into `SALES`, `SUPPORT`, or `OTHER`
- Configurable OpenAI and Anthropic providers with keyword fallback
- Supabase persistence and paginated lead search
- JWT-protected API routes and rate limits
- n8n workflow for routing leads to Google Sheets
- Lead statistics by intent and date range

## Tech stack

| Area | Technologies |
| --- | --- |
| API | Node.js, TypeScript, Fastify |
| Data | Supabase, PostgreSQL |
| AI | OpenAI, Anthropic, keyword fallback |
| Automation | n8n, Google Sheets |
| Validation and security | Zod, JWT, rate limiting |
| Local environment | Docker Compose |

## Run locally

### Prerequisites

- Docker and Docker Compose
- A Supabase project
- An OpenAI or Anthropic API key (optional; keyword classification is used when no provider is available)

### 1. Configure environment variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
API_KEY=replace-with-a-long-random-value
JWT_SECRET=replace-with-a-random-secret-at-least-16-characters-long
AI_PROVIDER=openai
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
N8N_USER=admin
N8N_PASSWORD=replace-with-a-strong-password
LOG_LEVEL=info
```

Keep `.env` and all API keys private. Set `AI_PROVIDER` to `openai` or `anthropic`; either provider key may be omitted to use the keyword fallback.

### 2. Create the database schema

In the Supabase SQL Editor, run [`docs/supabase-schema.sql`](docs/supabase-schema.sql).

### 3. Start the services

```bash
docker compose up --build -d
```

- API health check: `http://localhost:3000/health`
- n8n: `http://localhost:5678`

Import [`n8n/workflow-lead-intake.json`](n8n/workflow-lead-intake.json) into n8n, configure your Google Sheets credentials and destination spreadsheet, then activate the workflow.

## API

All lead routes require a bearer token. Generate one with the internal API key:

```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"your-api-key"}'
```

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `POST` | `/auth/token` | Exchange the internal API key for a 24-hour JWT |
| `POST` | `/leads` | Create and classify a lead |
| `GET` | `/leads` | List leads; supports pagination, intent filtering, and search |
| `GET` | `/leads/:id` | Get one lead |
| `GET` | `/leads/stats` | Get totals by intent and date range |

Example lead request:

```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"name":"Alex Silva","message":"I would like to learn more about the Pro plan"}'
```

## Project structure

```text
backend/   Fastify API, authentication, lead storage, and AI classification
docs/      Supabase database schema
n8n/       Lead intake and routing workflow
```

## Project status

This is a personal project for experimenting with AI-assisted lead intake and workflow automation. The n8n workflow requires your own Google Sheets credentials and spreadsheet configuration.
