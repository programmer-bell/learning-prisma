import type { Prisma } from '@prisma/client';

export type NoteFilters = {
  search?: string;
  tag?: string;
};

export function buildNoteWhere(userId: string, filters: NoteFilters = {}): Prisma.NoteWhereInput {
  const where: Prisma.NoteWhereInput = { userId };
  const search = filters.search?.trim();
  const tag = filters.tag?.trim();

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }
  if (tag) {
    where.tags = { some: { name: tag } };
  }

  return where;
}