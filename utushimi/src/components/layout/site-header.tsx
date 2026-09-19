import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import type { Role } from "@/generated/prisma/enums";

interface HeaderUser {
  name: string;
  role: Role;
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  return (
    <header className="border-b border-rule bg-banner">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-xl tracking-tight text-text-primary">
          Utushimi
        </Link>

        <nav className="mono-label hidden items-center gap-6 text-xs text-text-muted sm:flex">
          <Link href="/" className="hover:text-text-primary">
            Registry
          </Link>
          <Link href="/anthologies" className="hover:text-text-primary">
            Mockingbird Anthologies
          </Link>
          {user?.role === "WRITER" && (
            <Link href="/writer" className="hover:text-text-primary">
              Writer Desk
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-text-primary">
              Editorial Desk
            </Link>
          )}
        </nav>

        <div className="mono-label flex items-center gap-4 text-xs">
          {user ? (
            <>
              <span className="hidden text-text-faint sm:inline">{user.name}</span>
              <form action={logout}>
                <button type="submit" className="text-text-muted hover:text-accent">
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-text-muted hover:text-text-primary">
                Log In
              </Link>
              <Link href="/register" className="border border-input-border px-3 py-2 hover:border-accent">
                Join as Writer
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
