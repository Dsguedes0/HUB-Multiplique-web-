# Hub Multiplique — Vagas

Plataforma interna que conecta empresas parceiras do Hub Multiplique a candidatos da comunidade Poiema, com match automatizado e trilha de desenvolvimento gerada por IA.

**Stack:** Next.js 16 (App Router) · Supabase (Auth, Postgres, Storage) · Gemini 2.5 Flash

---

## Pré-requisitos

- Node.js 18+
- Projeto no [Supabase](https://supabase.com) (free tier)
- Chave de API do [Google AI Studio](https://aistudio.google.com/apikey) (free tier)

---

## Setup

**1. Instale as dependências**

```bash
npm install
```

**2. Rode as migrations**

No SQL Editor do Supabase, execute os arquivos de `supabase/migrations/` em ordem (0001 a 0007). Cada um é idempotente.

**3. Configure as variáveis de ambiente**

```bash
cp .env.example .env.local
```

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role — **secreta, nunca exponha no frontend** |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | opcional, default `gemini-2.5-flash` |

**4. Rode o projeto**

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## Primeiro admin

Ninguém se cadastra como admin pelo app. Crie uma conta (candidato ou empresa) e promova-a via SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'seu-email@aqui.com';
```

---

## Estrutura

```
src/
  app/
    login/, signup/       autenticação e cadastro
    candidato/             vagas, régua de match, trilha de IA, perfil
    empresa/                dados da empresa, vagas, candidatos
    admin/                   aprovação de empresas, convites, métricas
  components/               UI compartilhada
  lib/
    supabase/                clientes (browser/server/admin) e middleware de sessão
    match/score.ts            motor de match determinístico (sem IA)
    ai/                        camada de IA — provider trocável em ai/provider.ts
  types/database.ts          tipos das tabelas
supabase/migrations/        schema completo + RLS, em ordem
```

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | ambiente de desenvolvimento |
| `npm run build` | build de produção |
| `npm run start` | serve o build de produção |
| `npm run lint` | ESLint |

---
