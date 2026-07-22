import { EmpresasBrowser, type EmpresasSearchParams } from "@/components/EmpresasBrowser";

export default async function EmpresasEmpresaPage({
  searchParams,
}: {
  searchParams: Promise<EmpresasSearchParams>;
}) {
  const params = await searchParams;
  return <EmpresasBrowser basePath="/empresa/empresas" searchParams={params} />;
}
