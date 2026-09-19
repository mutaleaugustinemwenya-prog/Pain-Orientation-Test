import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const { as } = await searchParams;
  const role = as === "writer" ? "writer" : "reader";

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="mono-label text-[0.65rem] text-text-faint">New Registry Entry</p>
      <h1 className="font-display mt-2 text-3xl text-text-primary">
        {role === "writer" ? "Register as a Writer" : "Create a Reader Account"}
      </h1>

      <div className="mono-label mt-6 flex gap-2 text-xs">
        <Link
          href="/register"
          className={`border px-4 py-2 ${role === "reader" ? "border-accent text-accent-strong" : "border-input-border text-text-muted"}`}
        >
          Reader
        </Link>
        <Link
          href="/register?as=writer"
          className={`border px-4 py-2 ${role === "writer" ? "border-accent text-accent-strong" : "border-input-border text-text-muted"}`}
        >
          Writer
        </Link>
      </div>

      <div className="mt-8">
        <RegisterForm as={role} />
      </div>

      <p className="mono-label mt-6 text-center text-xs text-text-faint">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-strong hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
