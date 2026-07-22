-- ============================================================================
-- Hub Multiplique — tela "Empresas" (listagem para empresas e candidatos)
-- Rode este arquivo no SQL Editor do Supabase (Dashboard > SQL Editor > New
-- query > cole tudo > Run). Idempotente: pode rodar mais de uma vez.
--
-- Hoje só o papel "candidato" enxerga empresas ativas (ver 0001_init.sql).
-- Essas policies liberam o mesmo acesso para o papel "empresa", e também
-- deixam o papel "empresa" contar as vagas abertas de outras empresas
-- (necessário para mostrar "X vagas abertas" e o selo de destaque na lista).
-- ============================================================================

drop policy if exists "companies: empresa vê empresas ativas" on public.companies;
create policy "companies: empresa vê empresas ativas" on public.companies
  for select using (status = 'ativa' and public.current_role() = 'empresa');

drop policy if exists "jobs: empresa vê vagas abertas de empresas ativas" on public.jobs;
create policy "jobs: empresa vê vagas abertas de empresas ativas" on public.jobs
  for select using (
    public.current_role() = 'empresa'
    and status = 'aberta'
    and exists(select 1 from public.companies c where c.id = company_id and c.status = 'ativa')
  );
