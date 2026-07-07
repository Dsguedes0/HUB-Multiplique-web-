import { Logo } from "@/components/Logo";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-5"
      style={{
        background: "radial-gradient(circle at 20% 20%, #1c1c20, var(--hub-black) 60%)",
      }}
    >
      <div className="w-full max-w-[420px] rounded-[20px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,.35)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-1">
            <Logo variant="light-bg" size={56} showSub={false} />
          </div>
        </div>

        <h1 className="mb-1.5 text-center text-lg font-extrabold text-hub-black">
          Criar nova senha
        </h1>
        <p className="mb-5 text-center text-[12.5px] text-hub-muted-2">
          Escolha uma senha nova com pelo menos 8 caracteres.
        </p>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
