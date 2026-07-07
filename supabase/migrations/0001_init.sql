-- ============================================================================
-- Hub Multiplique — schema inicial
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Dashboard > SQL Editor > New query > cole tudo > Run)
--
-- Esse arquivo é seguro de rodar mais de uma vez (idempotente): tabelas,
-- funções, triggers e políticas são recriadas sem erro se já existirem.
-- ============================================================================

-- ---------- Extensões ----------
create extension if not exists "pgcrypto";

-- ---------- Tipos ----------
do $$ begin
  create type user_role as enum ('admin', 'empresa', 'candidato');
exception when duplicate_object then null; end $$;

do $$ begin
  create type company_status as enum ('pendente', 'ativa', 'inativa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('aberta', 'pausada', 'preenchida');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_modality as enum ('presencial', 'hibrido', 'remoto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_type as enum ('clt', 'pj', 'estagio', 'temporario');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('candidatou', 'visualizado', 'entrevista', 'rejeitado', 'contratado');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- PROFILES — 1 linha por usuário autenticado (espelha auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'candidato',
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- helper: papel do usuário logado (evita repetir subquery em toda policy)
create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false);
$$;

grant execute on function public.current_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "profiles: usuário vê o próprio perfil" on public.profiles;
create policy "profiles: usuário vê o próprio perfil" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: usuário atualiza o próprio perfil" on public.profiles;
create policy "profiles: usuário atualiza o próprio perfil" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================================
-- INVITE CODES — controle de acesso da comunidade (só candidatos)
-- ============================================================================
create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_by uuid references public.profiles(id),
  max_uses int not null default 1,
  uses_count int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

drop policy if exists "invite_codes: só admin enxerga" on public.invite_codes;
create policy "invite_codes: só admin enxerga" on public.invite_codes
  for select using (public.is_admin());
drop policy if exists "invite_codes: só admin gerencia" on public.invite_codes;
create policy "invite_codes: só admin gerencia" on public.invite_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- Função usada pelo backend (service role) para validar e consumir um código
-- de convite de forma atômica antes de criar a conta do candidato.
create or replace function public.redeem_invite_code(p_code text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_ok boolean;
begin
  update public.invite_codes
    set uses_count = uses_count + 1
    where code = p_code
      and active = true
      and uses_count < max_uses
      and (expires_at is null or expires_at > now())
    returning true into v_ok;
  return coalesce(v_ok, false);
end;
$$;

-- Precisa ser chamável por quem AINDA NÃO tem conta (tela de cadastro),
-- então liberamos execução para o papel anônimo do Supabase. A função em
-- si só permite "gastar" um uso de código válido — não vaza dados da tabela.
grant execute on function public.redeem_invite_code(text) to anon, authenticated;

-- ============================================================================
-- COMPANIES
-- ============================================================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  cnpj text,
  sector text,
  size text,
  description text,
  city text,
  website text,
  logo_url text,
  status company_status not null default 'pendente',
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;

drop policy if exists "companies: dono ou admin vê tudo" on public.companies;
create policy "companies: dono ou admin vê tudo" on public.companies
  for select using (owner_id = auth.uid() or public.is_admin());
drop policy if exists "companies: candidatos veem empresas ativas" on public.companies;
create policy "companies: candidatos veem empresas ativas" on public.companies
  for select using (status = 'ativa' and public.current_role() = 'candidato');
drop policy if exists "companies: dono cria a própria empresa" on public.companies;
create policy "companies: dono cria a própria empresa" on public.companies
  for insert with check (owner_id = auth.uid());
drop policy if exists "companies: dono edita, admin edita/aprova" on public.companies;
create policy "companies: dono edita, admin edita/aprova" on public.companies
  for update using (owner_id = auth.uid() or public.is_admin());

-- ============================================================================
-- JOBS
-- ============================================================================
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  requirements jsonb not null default '[]', -- [{skill, weight, level_required}]
  seniority text,
  type job_type not null default 'clt',
  modality job_modality not null default 'presencial',
  salary_range text,
  status job_status not null default 'aberta',
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

drop policy if exists "jobs: empresa dona vê e gerencia" on public.jobs;
create policy "jobs: empresa dona vê e gerencia" on public.jobs
  for all using (
    exists(select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
    or public.is_admin()
  ) with check (
    exists(select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
    or public.is_admin()
  );
drop policy if exists "jobs: candidatos veem vagas abertas de empresas ativas" on public.jobs;
create policy "jobs: candidatos veem vagas abertas de empresas ativas" on public.jobs
  for select using (
    public.current_role() = 'candidato'
    and exists(select 1 from public.companies c where c.id = company_id and c.status = 'ativa')
  );

-- ============================================================================
-- APPLICATIONS
-- (precisa vir antes de CANDIDATE PROFILES: a policy de candidate_profiles
-- mais abaixo faz join com applications, então a tabela já tem que existir)
-- ============================================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  match_score int,
  match_breakdown jsonb not null default '[]', -- [{criterio, valor, obs}]
  status application_status not null default 'candidatou',
  created_at timestamptz not null default now(),
  unique(job_id, candidate_id)
);

alter table public.applications enable row level security;

drop policy if exists "applications: candidato vê e cria as próprias" on public.applications;
create policy "applications: candidato vê e cria as próprias" on public.applications
  for select using (candidate_id = auth.uid() or public.is_admin());
drop policy if exists "applications: candidato se candidata" on public.applications;
create policy "applications: candidato se candidata" on public.applications
  for insert with check (candidate_id = auth.uid());
drop policy if exists "applications: empresa vê candidaturas das próprias vagas" on public.applications;
create policy "applications: empresa vê candidaturas das próprias vagas" on public.applications
  for select using (
    exists(select 1 from public.jobs j join public.companies c on c.id = j.company_id
      where j.id = job_id and c.owner_id = auth.uid())
  );
drop policy if exists "applications: empresa atualiza status" on public.applications;
create policy "applications: empresa atualiza status" on public.applications
  for update using (
    exists(select 1 from public.jobs j join public.companies c on c.id = j.company_id
      where j.id = job_id and c.owner_id = auth.uid())
    or public.is_admin()
  );

-- ============================================================================
-- CANDIDATE PROFILES — perfil estruturado (1:1 com profiles de candidatos)
-- ============================================================================
create table if not exists public.candidate_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  availability text,
  salary_expectation text,
  education text,
  skills jsonb not null default '[]',      -- [{name, level}]
  experiences jsonb not null default '[]', -- [{title, company, months, description}]
  cv_url text,
  cv_parsed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.candidate_profiles enable row level security;

drop policy if exists "candidate_profiles: dono vê e edita" on public.candidate_profiles;
create policy "candidate_profiles: dono vê e edita" on public.candidate_profiles
  for all using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
drop policy if exists "candidate_profiles: empresa vê perfil de quem se candidatou" on public.candidate_profiles;
create policy "candidate_profiles: empresa vê perfil de quem se candidatou" on public.candidate_profiles
  for select using (
    exists(
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.companies c on c.id = j.company_id
      where a.candidate_id = candidate_profiles.id and c.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- DEVELOPMENT TRACKS — trilha de IA por candidatura
-- ============================================================================
create table if not exists public.development_tracks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  items jsonb not null default '[]', -- [{titulo, desc, prioridade, prazo}]
  ai_model_used text,
  generated_at timestamptz not null default now()
);

alter table public.development_tracks enable row level security;

drop policy if exists "development_tracks: candidato dono vê/cria" on public.development_tracks;
create policy "development_tracks: candidato dono vê/cria" on public.development_tracks
  for all using (
    exists(select 1 from public.applications a where a.id = application_id and a.candidate_id = auth.uid())
    or public.is_admin()
  ) with check (
    exists(select 1 from public.applications a where a.id = application_id and a.candidate_id = auth.uid())
    or public.is_admin()
  );

-- ============================================================================
-- TRIGGER: cria profile (+ candidate_profile, se aplicável) ao criar usuário
-- O papel e o nome vêm de auth.users.raw_user_meta_data, setados no signup.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role user_role;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'candidato');

  insert into public.profiles (id, role, full_name, email)
  values (new.id, v_role, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;

  if v_role = 'candidato' then
    insert into public.candidate_profiles (id) values (new.id)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- STORAGE — buckets para currículos e logos
-- ============================================================================
insert into storage.buckets (id, name, public)
  values ('cvs', 'cvs', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('logos', 'logos', true)
  on conflict (id) do nothing;

drop policy if exists "cvs: candidato lê/escreve o próprio arquivo" on storage.objects;
create policy "cvs: candidato lê/escreve o próprio arquivo"
  on storage.objects for all
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "logos: leitura pública, escrita pelo dono da empresa" on storage.objects;
create policy "logos: leitura pública, escrita pelo dono da empresa"
  on storage.objects for select using (bucket_id = 'logos');
drop policy if exists "logos: dono da empresa escreve" on storage.objects;
create policy "logos: dono da empresa escreve"
  on storage.objects for insert with check (bucket_id = 'logos' and auth.uid() is not null);

-- ============================================================================
-- Promover o primeiro admin manualmente (rode depois de criar sua conta):
--   update public.profiles set role = 'admin' where email = 'seu-email@aqui.com';
-- ============================================================================
