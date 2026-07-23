-- ============================================================================
-- Hub Multiplique — estatísticas públicas da landing page
--
-- Bug: a landing page ("/") roda para visitante ANÔNIMO (ainda não logado),
-- mas as policies de RLS de companies/jobs só liberam SELECT para quem já
-- está autenticado com role 'candidato' ou 'empresa' (ver 0001_init.sql e
-- 0002_empresas_browse.sql). Resultado: para o role anon, current_role()
-- retorna null e as contagens de "vagas abertas"/"empresas parceiras" na
-- home davam sempre 0 — mesmo havendo empresas ativas e vagas abertas reais.
--
-- Fix: função security definer que só devolve dois números agregados (não
-- expõe nome, cnpj, e-mail nem qualquer coluna de companies/jobs), liberada
-- para o role anon. Evita ter que afrouxar a RLS das tabelas base.
-- ============================================================================

create or replace function public.landing_stats()
returns table(vagas_abertas bigint, empresas_ativas bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.jobs j
       join public.companies c on c.id = j.company_id
       where j.status = 'aberta' and c.status = 'ativa') as vagas_abertas,
    (select count(*) from public.companies where status = 'ativa') as empresas_ativas;
$$;

grant execute on function public.landing_stats() to anon, authenticated;
