import type { Genre } from "@/generated/prisma/enums";

export const GENRE_LABELS: Record<Genre, string> = {
  FICTION: "Fiction",
  ROMANCE: "Romance",
  THRILLER: "Thriller",
  SCIFI: "Science Fiction",
  HORROR: "Horror",
  DRAMA: "Drama",
  POETRY: "Poetry",
  NONFICTION: "Nonfiction",
  FOLKTALE: "Folktale",
  OTHER: "Other",
};

export const GENRES = Object.keys(GENRE_LABELS) as Genre[];

export function isGenre(value: string | undefined): value is Genre {
  return !!value && value in GENRE_LABELS;
}
