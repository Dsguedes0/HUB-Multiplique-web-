-- ============================================================================
-- Hub Multiplique — corrige listagem pública do bucket "logos" (0004)
-- Rode este arquivo no SQL Editor do Supabase, depois de 0001, 0002 e 0003.
-- Idempotente: pode rodar mais de uma vez.
-- ============================================================================

-- O Supabase Advisor (security) apontou "Public Bucket Allows Listing": a
-- policy de SELECT em storage.objects para o bucket "logos" usava apenas
-- `bucket_id = 'logos'`, sem restringir nada — isso permite que qualquer
-- pessoa liste todos os arquivos do bucket via /storage/v1/object/list,
-- não só ler uma logo específica por URL.
--
-- O bucket "logos" já é público (storage.buckets.public = true), e buckets
-- públicos servem GET /storage/v1/object/public/{bucket}/{path} direto, sem
-- checar RLS. A policy de SELECT só existia para permitir listagem — e o
-- app nunca lista o bucket (grep em src/ não mostra nenhum `.list()` ou
-- `.from('logos')`; a UI usa a coluna `companies.logo_url`, já uma URL
-- pública direta). Por isso é seguro remover a policy sem quebrar a
-- exibição das logos.
drop policy if exists "logos: leitura pública, escrita pelo dono da empresa" on storage.objects;
