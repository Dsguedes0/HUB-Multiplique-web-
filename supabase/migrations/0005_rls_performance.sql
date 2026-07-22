-- ============================================================================
-- Hub Multiplique — performance de RLS (0005)
-- Rode este arquivo no SQL Editor do Supabase, depois de 0001-0004.
-- Idempotente na maior parte (usa drop/create policy); rodar de novo é seguro.
-- ============================================================================
--
-- Dois problemas apontados pelo Supabase Advisor (performance), sem mudança
-- de comportamento — só reescreve as mesmas condições de acesso de forma
-- mais barata para o Postgres:
--
-- 1) auth_rls_initplan: `auth.uid()` chamado direto dentro de uma policy é
--    reavaliado LINHA A LINHA. Envolver em `(select auth.uid())` faz o
--    Postgres resolver uma vez só por statement (InitPlan).
-- 2) multiple_permissive_policies: quando uma tabela tem mais de uma policy
--    permissiva pro mesmo comando (ex: 3 policies de SELECT), o Postgres
--    roda TODAS pra cada linha e faz OR entre elas — exatamente o mesmo
--    resultado de uma única policy com as condições unidas por OR, só que
--    mais devagar. Consolidamos em uma política por comando onde havia
--    sobreposição.
--
-- Nenhuma condição de acesso foi removida ou apertada — só reescrita/unida.

-- ---------- profiles ----------
alter policy "profiles: usuário vê o próprio perfil" on public.profiles
  using ((id = (select auth.uid())) or is_admin());

alter policy "profiles: usuário atualiza o próprio perfil" on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------- companies ----------
alter policy "companies: dono cria a própria empresa" on public.companies
  with check (owner_id = (select auth.uid()));

alter policy "companies: dono edita, admin edita/aprova" on public.companies
  using ((owner_id = (select auth.uid())) or is_admin());

drop policy if exists "companies: dono ou admin vê tudo" on public.companies;
drop policy if exists "companies: candidatos veem empresas ativas" on public.companies;
drop policy if exists "companies: empresa vê empresas ativas" on public.companies;

create policy "companies: leitura consolidada" on public.companies
  for select
  using (
    (owner_id = (select auth.uid()))
    or is_admin()
    or (status = 'ativa'::company_status
        and "current_role"() = any (array['candidato'::user_role, 'empresa'::user_role]))
  );

-- ---------- jobs ----------
-- (aplicado em produção quebrando a policy ALL original em 4 policies por
-- comando; a consolidação final das 3 policies de SELECT em uma só não foi
-- concluída nesta sessão — ver nota no fim do arquivo)
drop policy if exists "jobs: empresa dona vê e gerencia" on public.jobs;

create policy "jobs: empresa dona insere" on public.jobs
  for insert
  with check (
    (exists (select 1 from public.companies c where c.id = jobs.company_id and c.owner_id = (select auth.uid())))
    or is_admin()
  );

create policy "jobs: empresa dona atualiza" on public.jobs
  for update
  using (
    (exists (select 1 from public.companies c where c.id = jobs.company_id and c.owner_id = (select auth.uid())))
    or is_admin()
  )
  with check (
    (exists (select 1 from public.companies c where c.id = jobs.company_id and c.owner_id = (select auth.uid())))
    or is_admin()
  );

create policy "jobs: empresa dona deleta" on public.jobs
  for delete
  using (
    (exists (select 1 from public.companies c where c.id = jobs.company_id and c.owner_id = (select auth.uid())))
    or is_admin()
  );

create policy "jobs: dono e admin veem tudo" on public.jobs
  for select
  using (
    (exists (select 1 from public.companies c where c.id = jobs.company_id and c.owner_id = (select auth.uid())))
    or is_admin()
  );

-- TODO (ainda não aplicado): dropar "jobs: candidatos veem vagas abertas de
-- empresas ativas", "jobs: empresa vê vagas abertas de empresas ativas" e
-- "jobs: dono e admin veem tudo" acima e substituir pela policy única:
--
-- create policy "jobs: leitura consolidada" on public.jobs
--   for select
--   using (
--     (exists (select 1 from public.companies c where c.id = jobs.company_id and c.owner_id = (select auth.uid())))
--     or is_admin()
--     or ("current_role"() = 'candidato'::user_role and exists (select 1 from public.companies c where c.id = jobs.company_id and c.status = 'ativa'::company_status))
--     or ("current_role"() = 'empresa'::user_role and status = 'aberta'::job_status and exists (select 1 from public.companies c where c.id = jobs.company_id and c.status = 'ativa'::company_status))
--   );

-- ---------- applications ----------
alter policy "applications: candidato se candidata" on public.applications
  with check (candidate_id = (select auth.uid()));

alter policy "applications: empresa atualiza status" on public.applications
  using (
    (exists (select 1 from public.jobs j join public.companies c on c.id = j.company_id where j.id = applications.job_id and c.owner_id = (select auth.uid())))
    or is_admin()
  );

drop policy if exists "applications: candidato vê e cria as próprias" on public.applications;
drop policy if exists "applications: empresa vê candidaturas das próprias vagas" on public.applications;

create policy "applications: leitura consolidada" on public.applications
  for select
  using (
    (candidate_id = (select auth.uid()))
    or is_admin()
    or (exists (select 1 from public.jobs j join public.companies c on c.id = j.company_id where j.id = applications.job_id and c.owner_id = (select auth.uid())))
  );

-- ============================================================================
-- AINDA NÃO APLICADO em produção (bloqueado por um classificador de
-- segurança da ferramenta que negou chamadas repetidas de DDL na mesma
-- sessão — não é um problema do banco, é uma limitação da sessão em que
-- isso foi escrito). Rodar manualmente quando for possível:
-- ============================================================================

-- ---------- candidate_profiles ----------
-- drop policy if exists "candidate_profiles: dono vê e edita" on public.candidate_profiles;
-- drop policy if exists "candidate_profiles: empresa vê perfil de quem se candidatou" on public.candidate_profiles;
--
-- create policy "candidate_profiles: leitura consolidada" on public.candidate_profiles
--   for select
--   using (
--     (id = (select auth.uid()))
--     or is_admin()
--     or (exists (
--       select 1 from public.applications a
--       join public.jobs j on j.id = a.job_id
--       join public.companies c on c.id = j.company_id
--       where a.candidate_id = candidate_profiles.id and c.owner_id = (select auth.uid())
--     ))
--   );
--
-- create policy "candidate_profiles: dono insere" on public.candidate_profiles
--   for insert
--   with check ((id = (select auth.uid())) or is_admin());
--
-- create policy "candidate_profiles: dono atualiza" on public.candidate_profiles
--   for update
--   using ((id = (select auth.uid())) or is_admin())
--   with check ((id = (select auth.uid())) or is_admin());
--
-- create policy "candidate_profiles: dono deleta" on public.candidate_profiles
--   for delete
--   using ((id = (select auth.uid())) or is_admin());

-- ---------- development_tracks ----------
-- alter policy "development_tracks: candidato dono vê/cria" on public.development_tracks
--   using (
--     (exists (select 1 from public.applications a where a.id = development_tracks.application_id and a.candidate_id = (select auth.uid())))
--     or is_admin()
--   )
--   with check (
--     (exists (select 1 from public.applications a where a.id = development_tracks.application_id and a.candidate_id = (select auth.uid())))
--     or is_admin()
--   );

-- ---------- invite_codes ----------
-- "invite_codes: só admin gerencia" (ALL, is_admin()) já cobre SELECT;
-- "invite_codes: só admin enxerga" é 100% redundante (mesma condição).
-- drop policy if exists "invite_codes: só admin enxerga" on public.invite_codes;
