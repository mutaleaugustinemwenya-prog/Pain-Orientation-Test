import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { StatusStamp } from "@/components/ui/status-stamp";
import { RedactedBlock } from "@/components/ui/redacted-block";
import { AnthologyPaywallPanel } from "@/components/paywall-panel";
import { UnlockPoller } from "@/components/unlock-poller";

export default async function AnthologyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ purchase?: string }>;
}) {
  const { slug } = await params;
  const { purchase: purchaseId } = await searchParams;

  const anthology = await prisma.anthologyTitle.findUnique({ where: { slug } });
  if (!anthology || !anthology.published) notFound();

  const user = await getCurrentUser();

  const completedPurchase = user
    ? await prisma.anthologyPurchase.findFirst({
        where: { readerId: user.id, anthologyId: anthology.id, status: "COMPLETED" },
      })
    : null;

  const pendingPurchase =
    !completedPurchase && purchaseId && user
      ? await prisma.anthologyPurchase.findFirst({
          where: {
            id: purchaseId,
            readerId: user.id,
            anthologyId: anthology.id,
            status: { in: ["PENDING", "FAILED"] },
          },
        })
      : null;

  const unlocked = !!completedPurchase;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="mono-label text-[0.65rem] text-accent-strong">Official Storefront — Mockingbird Digital</p>

      <h1 className="font-display mt-4 text-3xl leading-tight text-text-primary sm:text-4xl">
        {anthology.title}
      </h1>
      <p className="mono-label mt-2 text-xs text-text-faint">{anthology.readTimeMinutes} MIN READ</p>

      <div className="mt-4">
        <StatusStamp label={unlocked ? "Unlocked" : "Sealed"} tone={unlocked ? "unlocked" : "sealed"} />
      </div>

      <p className="mt-6 text-lg leading-relaxed text-text-muted">{anthology.coverText}</p>

      <hr className="rule-divider my-8" />

      <div className="whitespace-pre-wrap font-body text-base leading-relaxed text-text-primary">
        {unlocked ? anthology.body : anthology.body.slice(0, anthology.previewCutoff)}
      </div>

      {!unlocked && (
        <>
          <RedactedBlock />

          <div className="mt-8">
            {pendingPurchase ? (
              <UnlockPoller purchaseId={pendingPurchase.id} kind="anthology" />
            ) : user ? (
              <AnthologyPaywallPanel anthologyId={anthology.id} priceNgwee={anthology.priceNgwee} />
            ) : (
              <div className="border border-rule bg-panel p-6 text-center">
                <p className="text-sm text-text-muted">Log in to unlock this title with Mobile Money.</p>
                <Link
                  href="/login"
                  className="mono-label mt-4 inline-block border border-accent px-5 py-3 text-xs text-accent-strong hover:bg-accent hover:text-text-primary"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
}
