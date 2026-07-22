"use client";

import { useRef, useState, useTransition } from "react";
import { Card, SectionTitle, Label, Input, Button, Tag } from "@/components/ui";
import { saveProfileAction, uploadAndExtractCvAction, deleteCvAction } from "./actions";
import type { CandidateExperience, CandidateSkill } from "@/types/database";

// Precisa espelhar os limites de src/lib/validation/profile.ts — o servidor
// rejeita (e o handleSave abaixo mostra o erro) qualquer payload fora
// desses limites, então truncamos aqui antes mesmo de chegar lá.
const MAX_ITEMS = 30;
const SKILL_NAME_MAX = 60;
const EXP_TEXT_MAX = 120;
const EXP_DESCRIPTION_MAX = 500;

function sanitizeSkill(s: CandidateSkill): CandidateSkill {
  return {
    name: s.name.slice(0, SKILL_NAME_MAX),
    level: Math.max(0, Math.min(100, Math.round(s.level))),
  };
}

function sanitizeExperience(e: CandidateExperience): CandidateExperience {
  return {
    title: e.title.slice(0, EXP_TEXT_MAX),
    company: e.company.slice(0, EXP_TEXT_MAX),
    months: Math.max(0, Math.min(600, Math.round(e.months))),
    description: e.description ? e.description.slice(0, EXP_DESCRIPTION_MAX) : e.description,
  };
}

export function PerfilClient({
  initial,
}: {
  initial: {
    fullName: string;
    availability: string;
    salaryExpectation: string;
    education: string;
    skills: CandidateSkill[];
    experiences: CandidateExperience[];
    cvUrl: string | null;
  };
}) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [availability, setAvailability] = useState(initial.availability);
  const [salaryExpectation, setSalaryExpectation] = useState(initial.salaryExpectation);
  const [education, setEducation] = useState(initial.education);
  const [skills, setSkills] = useState<CandidateSkill[]>(initial.skills);
  const [experiences, setExperiences] = useState<CandidateExperience[]>(initial.experiences);
  const [cvUrl, setCvUrl] = useState(initial.cvUrl);

  const [saving, startSave] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [deletingCv, startDeleteCv] = useTransition();
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function handleDeleteCv() {
    if (!confirm("Excluir o currículo enviado? As habilidades e experiências já preenchidas continuam no perfil.")) {
      return;
    }
    setUploadMsg(null);
    startDeleteCv(async () => {
      const res = await deleteCvAction();
      if (res.ok) {
        setCvUrl(null);
        setUploadMsg("Currículo excluído.");
      } else if (res.error) {
        setUploadMsg(res.error);
      }
    });
  }

  function updateSkill(i: number, patch: Partial<CandidateSkill>) {
    setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function removeSkill(i: number) {
    setSkills((prev) => prev.filter((_, idx) => idx !== i));
  }

  function removeExperience(i: number) {
    setExperiences((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Mescla o que já existia (adicionado à mão ou de um upload anterior) com o
  // que a IA acabou de extrair do currículo, em vez de substituir a lista —
  // assim nada que o candidato preencheu manualmente se perde. Dedup por
  // nome (skills) ou cargo+empresa (experiências), ignorando maiúsculas e
  // espaços nas pontas, para não duplicar quando o mesmo CV é reenviado.
  // Também sanitiza (trunca nomes/descrições) e limita a MAX_ITEMS — sem
  // isso, um currículo extenso gera uma lista maior que o schema do
  // servidor aceita e o "Salvar perfil" falha com um erro genérico (visto
  // em produção: "Array must contain at most 30 element(s)").
  function mergeSkills(existing: CandidateSkill[], incoming: CandidateSkill[]): CandidateSkill[] {
    const existingKeys = new Set(existing.map((s) => s.name.trim().toLowerCase()));
    const newOnes = incoming
      .filter((s) => !existingKeys.has(s.name.trim().toLowerCase()))
      .map(sanitizeSkill);
    return [...existing, ...newOnes].slice(0, MAX_ITEMS);
  }

  function mergeExperiences(
    existing: CandidateExperience[],
    incoming: CandidateExperience[]
  ): CandidateExperience[] {
    const existingKeys = new Set(
      existing.map((e) => `${e.title.trim().toLowerCase()}|${e.company.trim().toLowerCase()}`)
    );
    const newOnes = incoming
      .filter((e) => !existingKeys.has(`${e.title.trim().toLowerCase()}|${e.company.trim().toLowerCase()}`))
      .map(sanitizeExperience);
    return [...existing, ...newOnes].slice(0, MAX_ITEMS);
  }

  function handleUpload(file: File) {
    setUploadMsg(null);
    const fd = new FormData();
    fd.set("cv", file);
    startUpload(async () => {
      let res: Awaited<ReturnType<typeof uploadAndExtractCvAction>>;
      try {
        res = await uploadAndExtractCvAction(fd);
      } catch {
        // Sem este catch, uma falha aqui (ex.: a aba ficou aberta durante um
        // deploy e o Server Action referenciado não existe mais nessa versão
        // — "Failed to find Server Action") virava uma promise rejeitada
        // silenciosa: nada de mensagem, nada de skills/experiências, só a
        // tag estática de "currículo enviado" continuava visível, sem
        // nenhum sinal de que o envio falhou. Um F5 na página resolve esse
        // caso específico (recarrega o código mais recente).
        setUploadMsg(
          "Não foi possível processar o currículo. Atualize a página (F5) e tente enviar novamente."
        );
        return;
      }
      if (res.cvUrl) setCvUrl(res.cvUrl);
      if (res.extraction) {
        let addedSkills = 0;
        let addedExperiences = 0;
        let skillsTruncated = false;
        let experiencesTruncated = false;
        if (res.extraction.skills?.length) {
          setSkills((prev) => {
            const merged = mergeSkills(prev, res.extraction!.skills);
            addedSkills = merged.length - prev.length;
            skillsTruncated = merged.length >= MAX_ITEMS;
            return merged;
          });
        }
        if (res.extraction.experiences?.length) {
          setExperiences((prev) => {
            const merged = mergeExperiences(prev, res.extraction!.experiences);
            addedExperiences = merged.length - prev.length;
            experiencesTruncated = merged.length >= MAX_ITEMS;
            return merged;
          });
        }
        // Formação e disponibilidade continuam sendo campos únicos (não uma
        // lista), então só preenchemos se o candidato ainda não tinha escrito nada.
        if (res.extraction.education && !education) setEducation(res.extraction.education);
        if (res.extraction.availability && !availability) setAvailability(res.extraction.availability);
        const truncationNote =
          skillsTruncated || experiencesTruncated
            ? ` (limite de ${MAX_ITEMS} itens por lista atingido — remova alguns antes de salvar se o CV tinha mais.)`
            : "";
        setUploadMsg(
          `IA extraiu do currículo: ${addedSkills} habilidade(s) e ${addedExperiences} experiência(s) novas, adicionadas junto com o que você já tinha. Revise abaixo e clique em Salvar perfil.${truncationNote}`
        );
      } else if (res.error) {
        setUploadMsg(res.error);
      } else {
        // Não deveria acontecer (a action sempre retorna extraction ou
        // error), mas evita ficar sem nenhum feedback caso isso mude.
        setUploadMsg("Currículo enviado, mas a IA não retornou nada. Tente novamente em instantes.");
      }
    });
  }

  function handleSave() {
    setSaveOk(false);
    setSaveError(null);
    startSave(async () => {
      try {
        await saveProfileAction({
          fullName,
          availability,
          salaryExpectation,
          education,
          skills,
          experiences,
        });
        setSaveOk(true);
      } catch (err) {
        // saveProfileAction lança um Error com uma mensagem amigável quando a
        // validação (zod) falha — ex.: mais de 30 habilidades/experiências ou
        // uma descrição com mais de 500 caracteres, comum quando a IA extrai
        // muita coisa do currículo. Sem este catch, o erro não tratado
        // derrubava a página inteira em produção ("Não foi possível carregar
        // esta página" / Server Components render error).
        setSaveError(
          err instanceof Error ? err.message : "Não foi possível salvar o perfil. Tente novamente."
        );
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <SectionTitle>Dados</SectionTitle>
        <Label>Nome</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Disponibilidade</Label>
            <Input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="ex: Imediata" />
          </div>
          <div>
            <Label>Pretensão salarial</Label>
            <Input
              value={salaryExpectation}
              onChange={(e) => setSalaryExpectation(e.target.value)}
              placeholder="ex: R$ 2.200 - R$ 2.800"
            />
          </div>
        </div>
        <Label>Formação</Label>
        <Input value={education} onChange={(e) => setEducation(e.target.value)} />

        <SectionTitle>Currículo</SectionTitle>
        {cvUrl ? (
          <div className="flex items-center gap-2">
            <Tag tone="brand">📄 curriculo.pdf enviado — IA já pôde extrair skills e experiências</Tag>
            <button
              type="button"
              onClick={handleDeleteCv}
              disabled={deletingCv}
              aria-label="Excluir currículo"
              className="text-hub-muted hover:text-hub-red disabled:opacity-50"
            >
              ×
            </button>
          </div>
        ) : (
          <span className="text-xs text-hub-muted">Nenhum currículo enviado ainda.</span>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <div className="mt-3">
          <Button type="button" variant="ghost" disabled={uploading} onClick={() => fileInput.current?.click()}>
            {uploading ? "Enviando e lendo com IA…" : cvUrl ? "Enviar novo currículo (PDF)" : "Enviar currículo (PDF)"}
          </Button>
        </div>
        {uploadMsg && <div className="mt-2 text-[12px] font-semibold text-hub-muted-2">{uploadMsg}</div>}
      </Card>

      <Card>
        <SectionTitle>Habilidades</SectionTitle>
        {skills.length === 0 && (
          <div className="mb-3 text-xs text-hub-muted">
            Nenhuma habilidade ainda — adicione manualmente ou envie seu currículo.
          </div>
        )}
        {skills.map((s, i) => (
          <div key={i} className="mb-3">
            <div className="mb-1.5 flex items-center justify-between text-[12.5px] font-bold">
              <input
                value={s.name}
                onChange={(e) => updateSkill(i, { name: e.target.value })}
                className="w-2/3 border-b border-transparent bg-transparent focus:border-hub-red focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <span>{s.level}%</span>
                <button
                  type="button"
                  onClick={() => removeSkill(i)}
                  aria-label="Remover habilidade"
                  className="text-hub-muted hover:text-hub-red"
                >
                  ×
                </button>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={s.level}
              onChange={(e) => updateSkill(i, { level: Number(e.target.value) })}
              className="w-full accent-[#e8432e]"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          className="mb-4"
          onClick={() => setSkills((prev) => [...prev, { name: "Nova habilidade", level: 50 }])}
        >
          + Adicionar habilidade
        </Button>

        <SectionTitle>Experiências</SectionTitle>
        {experiences.map((exp, i) => (
          <div key={i} className="mb-3 rounded-lg border border-hub-line p-3">
            <div className="mb-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => removeExperience(i)}
                aria-label="Remover experiência"
                className="text-hub-muted hover:text-hub-red"
              >
                ×
              </button>
            </div>
            <Input
              value={exp.title}
              placeholder="Cargo"
              onChange={(e) =>
                setExperiences((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
              }
            />
            <Input
              value={exp.company}
              placeholder="Empresa"
              onChange={(e) =>
                setExperiences((prev) => prev.map((x, idx) => (idx === i ? { ...x, company: e.target.value } : x)))
              }
            />
            <Input
              type="number"
              value={exp.months}
              placeholder="Meses de duração"
              onChange={(e) =>
                setExperiences((prev) =>
                  prev.map((x, idx) => (idx === i ? { ...x, months: Number(e.target.value) } : x))
                )
              }
            />
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          className="mb-4"
          onClick={() =>
            setExperiences((prev) => [...prev, { title: "", company: "", months: 0 }])
          }
        >
          + Adicionar experiência
        </Button>

        <Button type="button" variant="primary" className="w-full" disabled={saving} onClick={handleSave}>
          {saving ? "Salvando…" : "Salvar perfil"}
        </Button>
        {saveOk && <div className="mt-2 text-center text-[12px] font-bold text-hub-green">Perfil salvo!</div>}
        {saveError && (
          <div className="mt-2 text-center text-[12px] font-semibold text-hub-red">{saveError}</div>
        )}
      </Card>
    </div>
  );
}
