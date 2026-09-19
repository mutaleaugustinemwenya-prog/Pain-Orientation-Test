import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { updateAnthology, deleteAnthology } from "@/lib/admin/anthology-actions";
import { AnthologyForm } from "@/components/admin/anthology-form";

export default async function EditAnthologyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;

  const anthology = await prisma.anthologyTitle.findUnique({ where: { id } });
  if (!anthology) notFound();

  const boundUpdate = updateAnthology.bind(null, anthology.id);
  const boundDelete = deleteAnthology.bind(null, anthology.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mono-label text-[0.65rem] text-accent-strong">Mockingbird Digital</p>
          <h1 className="font-display mt-1 text-3xl text-text-primary">{anthology.title}</h1>
        </div>
        {anthology.published && (
          <Link
            href={`/anthologies/${anthology.slug}`}
            className="mono-label text-xs text-accent-strong hover:underline"
          >
            View Live Page →
          </Link>
        )}
      </div>

      <div className="mt-8">
        <AnthologyForm
          action={boundUpdate}
          submitLabel="Save Changes"
          defaults={{
            title: anthology.title,
            priceNgwee: anthology.priceNgwee,
            coverText: anthology.coverText,
            body: anthology.body,
            readTimeMinutes: anthology.readTimeMinutes,
            previewCutoff: anthology.previewCutoff,
            published: anthology.published,
          }}
        />
      </div>

      <form action={boundDelete} className="mt-6">
        <button
          type="submit"
          className="mono-label border border-input-border px-4 py-2.5 text-xs text-text-faint hover:border-accent hover:text-accent-strong"
        >
          Delete Title
        </button>
      </form>
    </div>
  );
}
