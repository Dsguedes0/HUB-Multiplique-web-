"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export interface NavItem {
  href: string;
  label: string;
}

export function DashboardShell({
  navItems,
  userName,
  userInitial,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  userInitial: string;
  children: React.ReactNode;
}) {
  const activePath = usePathname();
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-white/[.06] bg-hub-black/90 px-4 py-3 backdrop-blur-md sm:px-7 sm:py-3.5">
        <Link href="/" className="group min-w-0 flex-none">
          <Logo variant="dark-bg" size={32} showSub={false} />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3.5">
          <div className="flex items-center gap-2 rounded-full border border-[#2c2c31] bg-[#1a1a1d] py-1.5 pl-1.5 pr-1.5 text-[13px] text-white sm:pr-3">
            <span className="flex h-6.5 w-6.5 flex-none items-center justify-center rounded-full bg-hub-red text-[12px] font-extrabold text-white">
              {userInitial}
            </span>
            <span className="hidden max-w-[140px] truncate sm:inline">{userName}</span>
          </div>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="flex-none rounded-full border border-[#2c2c31] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:border-hub-red hover:text-hub-red sm:px-3.5"
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-56px)] flex-col md:flex-row">
        <div className="flex gap-1.5 overflow-x-auto border-b border-hub-line bg-white p-2.5 md:w-[224px] md:flex-none md:flex-col md:gap-1 md:overflow-visible md:border-b-0 md:border-r md:p-3.5">
          {navItems.map((item) => {
            const active =
              activePath === item.href || activePath.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-none items-center gap-2.5 whitespace-nowrap rounded-[11px] px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-200 ease-[cubic-bezier(.22,1,.36,1)] md:w-full md:whitespace-normal ${
                  active
                    ? "bg-hub-black text-white"
                    : "text-hub-muted-2 hover:bg-hub-paper hover:text-hub-black md:hover:translate-x-0.5"
                }`}
              >
                <span className="h-1.5 w-1.5 flex-none rounded-full bg-hub-red transition-transform duration-200 group-hover:scale-125" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="anim-in max-w-[1120px] flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-9">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5 md:mb-7">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-[28px]">{title}</h1>
      {sub && <div className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-hub-muted-2 md:text-[14px]">{sub}</div>}
    </div>
  );
}
