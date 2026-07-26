import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { z } from "zod";
import { signIn, signUp } from "@/lib/auth.server";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — GuiaAcre" }] }),
  component: AuthPage,
});

const signupSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
  name: z.string().trim().min(2, "Informe seu nome").max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(1, "Senha obrigatória").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const doSignIn = useServerFn(signIn);
  const doSignUp = useServerFn(signUp);

  const redirectAfterAuth = (userRole: string) => {
    navigate({ to: userRole === "admin" ? "/admin" : "/perfil", replace: true });
  };

  useEffect(() => {
    if (!authLoading && user) redirectAfterAuth(user.role);
  }, [authLoading, user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.parse(form);
        const result = await doSignUp({ data: { email: parsed.email, password: parsed.password, name: parsed.name } });
        toast.success("Conta criada com sucesso!");
        await redirectAfterAuth(result.user.role);
      } else {
        const parsed = loginSchema.parse(form);
        const result = await doSignIn({ data: { email: parsed.email, password: parsed.password } });
        toast.success("Bem-vindo!");
        await redirectAfterAuth(result.user.role);
      }
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.errors[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell showBottomNav={false}>
      <header className="px-5 pt-12 pb-3 flex items-center gap-3">
        <Link to="/perfil" className="h-9 w-9 -ml-2 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </header>

      <div className="px-5 mt-2 mb-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-brand text-brand-foreground flex items-center justify-center mb-3">
          <MapPin className="h-7 w-7" fill="currentColor" />
        </div>
        <h1 className="font-display font-bold text-2xl">
          {mode === "login" ? "Entrar no GuiaAcre" : "Criar sua conta"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "login"
            ? "Acesse para gerenciar seus negócios"
            : "Cadastre-se para listar seu negócio"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="px-4 space-y-3">
        {mode === "signup" && (
          <Input
            placeholder="Seu nome"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
        )}
        <Input
          placeholder="E-mail"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <Input
          placeholder="Senha"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-brand text-brand-foreground font-display font-bold shadow-pill active:scale-[0.98] transition disabled:opacity-60"
        >
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center text-sm text-muted-foreground py-2"
        >
          {mode === "login"
            ? "Ainda não tem conta? Cadastre-se"
            : "Já tem conta? Entrar"}
        </button>
      </form>
    </MobileShell>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (v: string) => void;
};
function Input({ value, onChange, ...props }: InputProps) {
  return (
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl bg-card border border-border px-4 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
    />
  );
}
