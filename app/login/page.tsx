import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./ui/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          Iniciar sesión
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Ingresa con tu usuario y contraseña para acceder a tus predicciones.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}