import { requireRole } from "@/lib/auth/current-user";
import { createAnthology } from "@/lib/admin/anthology-actions";
import { AnthologyForm } from "@/components/admin/anthology-form";

export default async function NewAnthologyPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="mono-label text-[0.65rem] text-accent-strong">Mockingbird Digital</p>
      <h1 className="font-display mt-1 text-3xl text-text-primary">Add Anthology Title</h1>

      <div className="mt-8">
        <AnthologyForm action={createAnthology} submitLabel="Create Title" />
      </div>
    </div>
  );
}
