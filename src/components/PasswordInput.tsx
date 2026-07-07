"use client";

import { useState, type InputHTMLAttributes } from "react";

function EyeIcon({ off }: { off: boolean }) {
  if (off) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M9.4 5.3A10.6 10.6 0 0 1 12 5c5 0 9 4 10 7-.4 1.2-1.2 2.5-2.3 3.6M6.5 6.6C4.4 8 2.9 10 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
      <path
        d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7s-9-4-10-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const { className, ...rest } = props;

  return (
    <div className="relative mb-3.5">
      <input
        {...rest}
        type={visible ? "text" : "password"}
        className={`w-full rounded-lg border border-[#ddd9d0] bg-hub-paper px-3.5 py-2.5 pr-11 text-sm focus:border-hub-red focus:bg-white focus:outline-none ${className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-hub-muted hover:text-hub-black"
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}
