# Hub Multiplique — Vagas

App interno (fechado à comunidade) para conectar empresas parceiras do Hub
Multiplique a candidatos da comunidade Poiema. Ver o documento de arquitetura
na pasta do projeto para o desenho completo.

Stack: **Next.js 16 (App Router) · Supabase (auth + Postgres + storage) ·
Gemini 2.5 Flash (IA, free tier)**. Custo de hospedagem: R$0 nos free tiers.

---

## 1. Pré-requisitos

- Node.js 18 ou mais recente (`node -v` para conferir)
- Uma conta gratuita no [Supabase](https://supabase.com)
- Uma conta Google para gerar a chave gratuita do [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)

Nenhuma das duas pede cartão de crédito para o uso no free tier.

---

## 2. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **Start your project** → crie
   uma conta (dá pra usar login com GitHub/Google) → **New project**.
2. Dê um nome (ex: `hub-multiplique`), escolha uma senha de banco (guarde-a,
   mas ela não é usada no app) e a região mais próxima (`South America`).
3. Espere o projeto terminar de provisionar (1-2 minutos).

### Rodar o schema do banco

1. No menu lateral do projeto, abra **SQL Editor** → **New query**.
2. Abra o arquivo `supabase/migrations/0001_init.sql` deste projeto, copie
   todo o conteúdo e cole no editor.
3. Clique em **Run**. Isso cria todas as tabelas, as regras de segurança
   (Row Level Security) e os buckets de arquivo (`cvs` e `logos`).

### Pegar as chaves da API

1. No menu lateral: **Project Settings** → **API**.
2. Copie:
   - **Project URL** → vai em `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (em "Project API keys", clique em "Reveal") → vai em
     `SUPABASE_SERVICE_ROLE_KEY` — **essa chave é secreta, nunca a exponha no
     frontend nem suba pra um repositório público.**

---

## 3. Gerar a chave gratuita do Gemini

1. Acesse [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Faça login com uma conta Google e clique em **Create API key**.
3. Copie a chave → vai em `GEMINI_API_KEY`.

O free tier do Gemini Flash dá ~1.500 requisições/dia sem pedir cartão —
mais do que suficiente para o volume esperado do Hub. **Importante:** não
ative billing nesse projeto do Google, ou o free tier some. Se um dia
precisar trocar de provedor de IA (Groq, Claude, etc.), toda a lógica está
isolada em `src/lib/ai/` — troque só ali.

---

## 4. Configurar e rodar o app

```bash
cp .env.example .env.local
# edite .env.local e cole as 4 chaves que você pegou acima

npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## 5. Criar o primeiro admin

Ninguém se cadastra como admin pelo app (por segurança). Depois de rodar o
app e criar sua própria conta pela tela de **cadastro de empresa** ou pedindo
pra alguém te convidar como candidato, promova essa conta a admin direto no
Supabase:

1. **SQL Editor** → **New query**:
   ```sql
   update public.profiles set role = 'admin' where email = 'seu-email@aqui.com';
   ```
2. Rode. Da próxima vez que você logar em `/login`, vai cair no painel admin.

Do painel admin (`/admin/convites`) você já consegue gerar códigos de
convite para os primeiros candidatos da comunidade, e (`/admin/empresas`)
aprovar as primeiras empresas parceiras.

---

## 6. Estrutura do projeto

```
src/
  app/
    login/, signup/candidato/, signup/empresa/   → autenticação e cadastro
    candidato/                                    → vagas, régua de match, trilha de IA, perfil
    empresa/                                      → dados da empresa, vagas, ranking de candidatos
    admin/                                        → aprovação de empresas, convites, métricas
  components/                                     → Logo, Régua, DashboardShell, UI (Card/Button/Tag...)
  lib/
    supabase/                                     → clientes browser/server/admin + middleware de sessão
    match/score.ts                                → motor de match determinístico (não usa IA)
    ai/provider.ts, ai/gemini.ts                  → camada de IA (troque o provedor só aqui)
  types/database.ts                               → tipos das tabelas
supabase/migrations/0001_init.sql                 → schema completo + RLS
```

---

## 7. Próximos passos (fora do escopo desta etapa)

- **Deploy em produção**: `vercel deploy` (o app já está pronto pro Vercel
  free tier — só configurar as mesmas variáveis de ambiente lá).
- Notificações por e-mail (convite, aprovação, vaga compatível).
- Upload de logo da empresa (o bucket `logos` já existe na migration).
- Refinar o motor de match (`src/lib/match/score.ts`) com mais critérios
  conforme o uso real mostrar o que falta.
