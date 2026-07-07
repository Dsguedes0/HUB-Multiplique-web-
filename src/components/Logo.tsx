function Spark({ gradId }: { gradId: string }) {
  return (
    <svg viewBox="0 0 44 52" className="h-full w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8362" />
          <stop offset="100%" stopColor="#b8301f" />
        </linearGradient>
      </defs>
      <g transform="translate(22,17)">
        <rect x="-17" y="-3.4" width="34" height="6.8" rx="3.4" fill={`url(#${gradId})`} />
        <rect
          x="-17"
          y="-3.4"
          width="34"
          height="6.8"
          rx="3.4"
          fill={`url(#${gradId})`}
          transform="rotate(60)"
        />
        <rect
          x="-17"
          y="-3.4"
          width="34"
          height="6.8"
          rx="3.4"
          fill={`url(#${gradId})`}
          transform="rotate(120)"
        />
      </g>
      <rect x="8" y="35" width="28" height="6" rx="3" fill={`url(#${gradId})`} />
      <rect x="8" y="44" width="28" height="6" rx="3" fill={`url(#${gradId})`} />
    </svg>
  );
}

export function LogoMark({ size = 36, id = "spark" }: { size?: number; id?: string }) {
  return (
    <div
      className="flex flex-none items-center justify-center rounded-xl bg-hub-black"
      style={{ width: size, height: size, boxShadow: "0 0 16px rgba(232,67,46,.4)" }}
    >
      <div style={{ width: size * 0.74, height: size * 0.74 }}>
        <Spark gradId={id} />
      </div>
    </div>
  );
}

export function Logo({
  variant = "dark-bg",
  size = 36,
  showSub = true,
}: {
  variant?: "dark-bg" | "light-bg";
  size?: number;
  showSub?: boolean;
}) {
  const textColor = variant === "dark-bg" ? "text-white" : "text-hub-black";
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} id={variant} />
      <div className="flex flex-col leading-tight">
        <span className={`font-display text-[15px] tracking-wide ${textColor}`}>
          HUB MULTIPLIQUE
        </span>
        {showSub && (
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-hub-muted">
            por Poiema
          </span>
        )}
      </div>
    </div>
  );
}
