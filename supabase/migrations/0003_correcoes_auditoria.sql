-- ============================================================================
-- Hub Multiplique — correções da auditoria de código (0003)
-- Rode este arquivo no SQL Editor do Supabase, depois de 0001 e 0002.
-- Idempotente: pode rodar mais de uma vez.
-- ============================================================================

-- ---------- Índices em FKs usadas pela aplicação e pelas policies de RLS ----------
-- Postgres não indexa automaticamente colunas de FK. Essas colunas são
-- filtradas em praticamente toda query da aplicação e dentro das subqueries
-- exists(...) de várias policies — sem índice, cada leitura protegida por
-- RLS faz sequential scan + join. Ver auditoria de código, item #5.
create index if not exists idx_companies_owner_id on public.companies(owner_id);
create index if not exists idx_jobs_company_id on public.jobs(company_id);
create index if not exists idx_jobs_status on public.jobs(status);
create index if not exists idx_applications_job_id on public.applications(job_id);
create index if not exists idx_applications_candidate_id on public.applications(candidate_id);
create index if not exists idx_development_tracks_application_id
  on public.development_tracks(application_id);

-- ---------- UNIQUE em companies.owner_id ----------
-- A aplicação inteira assume 1 empresa por conta (várias páginas fazem
-- .eq("owner_id", user.id).single()), mas nada no schema garantia isso.
-- Ver auditoria de código, item #4.
-- (drop + add em vez de um bloco do $$ ... exception $$ — mais simples de
-- colar no SQL Editor e igualmente idempotente.)
alter table public.companies drop constraint if exists companies_owner_id_key;
alter table public.companies add constraint companies_owner_id_key unique (owner_id);

-- ---------- check_invite_code: valida sem consumir ----------
-- Usado para checar a validade do código ANTES de criar a conta do
-- candidato. O consumo definitivo (redeem_invite_code, que incrementa
-- uses_count) só deve acontecer depois que o auth.signUp for bem-sucedido —
-- caso contrário uma falha de signUp (e-mail duplicado, instabilidade de
-- rede, etc.) queima um uso do convite sem nenhuma conta ter sido criada.
-- Ver auditoria de código, item #3.
create or replace function public.check_invite_code(p_code text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.invite_codes
    where code = p_code
      and active = true
      and uses_count < max_uses
      and (expires_at is null or expires_at > now())
  );
$$;

grant execute on function public.check_invite_code(text) to anon, authenticated;
