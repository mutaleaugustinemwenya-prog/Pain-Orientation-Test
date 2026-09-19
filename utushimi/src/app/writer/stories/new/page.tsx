import { requireRole } from "@/lib/auth/current-user";
import { createStory } from "@/lib/stories/writer-actions";
import { StoryForm } from "@/components/writer/story-form";

export default async function NewStoryPage() {
  await requireRole("WRITER");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="mono-label text-[0.65rem] text-text-faint">New Submission</p>
      <h1 className="font-display mt-1 text-3xl text-text-primary">Submit a Story</h1>
      <p className="mt-2 text-sm text-text-muted">
        Your story enters the editorial review queue before it appears in the registry.
      </p>

      <div className="mt-8">
        <StoryForm action={createStory} submitLabel="Submit For Review" />
      </div>
    </div>
  );
}
