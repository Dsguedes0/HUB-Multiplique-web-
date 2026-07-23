-- ============================================================================
-- Hub Multiplique — empresa vê o perfil de quem se candidatou (0006)
-- ============================================================================
--
-- Bug: na tela "Minhas vagas" da empresa, a lista de candidatos sempre
-- mostrava "Candidato" no lugar do nome real. Causa: a policy de SELECT em
-- public.profiles só permitia o próprio usuário (ou admin) ler uma linha —
-- não existia nenhuma exceção para a empresa dona da vaga ler o perfil
-- (nome/email) de quem se candidatou. O join `profiles(full_name)` feito
-- pela empresa era silenciosamente filtrado pelo RLS e voltava null, daí o
-- fallback "Candidato" no código (src/app/empresa/vagas/[id]/page.tsx).
--
-- Mesmo problema já não acontecia em public.candidate_profiles (skills,
-- experiências, educação) porque essa tabela já tinha a policy
-- "candidate_profiles: empresa vê perfil de quem se candidatou". Esta
-- migration adiciona a mesma condição para public.profiles, consolidada na
-- policy de SELECT existente (em vez de criar uma segunda policy permissiva
-- redundante — mesmo padrão de 0005_rls_performance.sql).
--
-- Também libera a leitura do currículo (bucket "cvs" no Storage) para a
-- empresa dona da vaga a que o candidato se candidatou, já que antes só o
-- próprio candidato podia ler o arquivo.

-- ---------- profiles: SELECT consolidado ----------
alter policy "profiles: usuário vê o próprio perfil" on public.profiles
  using (
    (id = (select auth.uid()))
    or is_admin()
    or (exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.companies c on c.id = j.company_id
      where a.candidate_id = profiles.id
        and c.owner_id = (select auth.uid())
    ))
  );

-- ---------- storage.objects (bucket "cvs"): empresa lê currículo de quem se candidatou ----------
--
-- Cuidado: dentro do EXISTS abaixo, `companies` também tem uma coluna
-- `name` — uma referência não qualificada a `name` dentro do subselect
-- resolve para `companies.name`, não para `objects.name` (a tabela sendo
-- protegida pela policy), e a condição fica sempre falsa sem erro nenhum
-- (bug real cometido na primeira versão desta migration, pego só ao
-- inspecionar `pg_policies` depois de aplicar). Por isso `objects.name` é
-- qualificado explicitamente abaixo.
create policy "cvs: empresa lê currículo de quem se candidatou"
  on storage.objects
  for select
  using (
    objects.bucket_id = 'cvs'
    and exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.companies c on c.id = j.company_id
      where a.candidate_id::text = (storage.foldername(objects.name))[1]
        and c.owner_id = (select auth.uid())
    )
  );
