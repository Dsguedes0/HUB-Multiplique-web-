import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-hub-line bg-white p-5.5 shadow-[0_8px_24px_rgba(0,0,0,.08)] transition-all duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)] ${
        hover ? "hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,.12)] hover:border-hub-red/40" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

const buttonVariants = {
  primary: "bg-hub-black text-white hover:bg-[#232327] hover:shadow-[0_10px_24px_rgba(0,0,0,.18)]",
  brand: "bg-hub-red text-white hover:bg-hub-red-dark hover:shadow-[0_10px_24px_rgba(232,67,46,.28)]",
  ghost: "border border-hub-line text-hub-black hover:border-hub-black bg-transparent",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-bold transition-all duration-[200ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ${buttonVariants[variant]} ${className}`}
    />
  );
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "green" | "amber" | "red";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-hub-paper border-hub-line text-hub-muted-2",
    brand: "bg-[#fce8e3] border-[#f4c6ba] text-hub-red-dark",
    green: "bg-[#e9f7ee] border-[#c9ecd6] text-hub-green",
    amber: "bg-[#fbf1de] border-[#f0dcae] text-[#96701c]",
    red: "bg-[#fbeceb] border-[#f0c9c7] text-hub-danger",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11.5px] font-bold transition-colors duration-200 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-hub-muted-2"
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mb-3.5 w-full rounded-lg border border-[#ddd9d0] bg-hub-paper px-3.5 py-2.5 text-sm transition-colors duration-200 focus:border-hub-red focus:bg-white focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`mb-3.5 w-full rounded-lg border border-[#ddd9d0] bg-hub-paper px-3.5 py-2.5 text-sm transition-colors duration-200 focus:border-hub-red focus:bg-white focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3.5 mt-7 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-wider text-hub-muted-2 first:mt-0">
      <span className="h-3 w-[3px] flex-none rounded-sm bg-hub-red" />
      {children}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <div className="py-4 text-sm text-hub-muted">{children}</div>;
}

export function BarList({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-3.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex justify-between gap-2 text-[12.5px] font-bold">
            <span className="truncate">{item.label}</span>
            <span className="flex-none">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-hub-line">
            <div
              className="h-full rounded-full bg-hub-red transition-[width] duration-500"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
