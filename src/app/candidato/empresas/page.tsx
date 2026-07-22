import { EmpresasBrowser, type EmpresasSearchParams } from "@/components/EmpresasBrowser";

export default async function EmpresasCandidatoPage({
  searchParams,
}: {
  searchParams: Promise<EmpresasSearchParams>;
}) {
  const params = await searchParams;
  return <EmpresasBrowser basePath="/candidato/empresas" searchParams={params} />;
}
