"use client";

import { useState } from "react";
import { Label, Input, Button } from "@/components/ui";
import type { JobRequirement } from "@/types/database";

/** Configura peso e nível mínimo por habilidade exigida pela vaga. */
export function RequirementsEditor({ initial = [] }: { initial?: JobRequirement[] }) {
  const [rows, setRows] = useState<JobRequirement[]>(
    initial.length > 0 ? initial : [{ skill: "", weight: 3, level_required: 60 }]
  );

  function update(i: number, patch: Partial<JobRequirement>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { skill: "", weight: 3, level_required: 60 }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  const cleanRows = rows.filter((r) => r.skill.trim().length > 0);

  return (
    <div className="mb-3.5">
      <Label>Requisitos técnicos</Label>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={row.skill}
              onChange={(e) => update(i, { skill: e.target.value })}
              placeholder="ex: Node.js"
              className="mb-0 flex-1"
            />
            <div className="flex flex-none items-center gap-1 text-[11px] font-bold text-hub-muted-2">
              Peso
              <select
                value={row.weight}
                onChange={(e) => update(i, { weight: Number(e.target.value) })}
                className="rounded-lg border border-[#ddd9d0] bg-hub-paper px-2 py-2.5 text-sm"
              >
                {[1, 2, 3, 4, 5].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-none items-center gap-1 text-[11px] font-bold text-hub-muted-2">
              Nível mín.
              <Input
                type="number"
                min={0}
                max={100}
                value={row.level_required}
                onChange={(e) => update(i, { level_required: Number(e.target.value) })}
                className="mb-0 w-16"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="Remover requisito"
              className="flex-none rounded-full border border-hub-line px-2 py-1 text-xs font-bold text-hub-muted-2 hover:border-hub-red hover:text-hub-red"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" className="mt-2" onClick={addRow}>
        + Adicionar requisito
      </Button>
      <input type="hidden" name="requirementsJson" value={JSON.stringify(cleanRows)} />
    </div>
  );
}
