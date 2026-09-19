import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="mono-label text-[0.65rem] text-text-faint">Registry Access</p>
      <h1 className="font-display mt-2 text-3xl text-text-primary">Log In</h1>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mono-label mt-6 text-center text-xs text-text-faint">
        New here?{" "}
        <Link href="/register" className="text-accent-strong hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
