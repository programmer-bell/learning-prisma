import { prisma } from '@/lib/prisma';
import { buildNoteWhere, type NoteFilters } from '@/lib/note-query';

export type NoteInput = {
  title: string;
  content: string;
  tagIds: readonly string[];
};

export async function listTags() {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } });
}

export async function noteTagsExist(tagIds: readonly string[]) {
  if (tagIds.length === 0) return true;
  const tags = await prisma.tag.findMany({
    where: { id: { in: [...tagIds] } },
    select: { id: true },
  });
  return tags.length === tagIds.length;
}

export async function listNotesForUser(userId: string, filters: NoteFilters = {}) {
  return prisma.note.findMany({
    where: buildNoteWhere(userId, filters),
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getNoteForUser(noteId: string, userId: string) {
  return prisma.note.findFirst({
    where: { id: noteId, userId },
    include: { tags: true },
  });
}

export async function createNoteForUser(userId: string, input: NoteInput) {
  return prisma.note.create({
    data: {
      title: input.title,
      content: input.content,
      userId,
      tags: { connect: input.tagIds.map((id) => ({ id })) },
    },
  });
}

export async function updateNoteForUser(
  noteId: string,
  userId: string,
  input: NoteInput
) {
  return prisma.$transaction(async (transaction) => {
    const ownedNote = await transaction.note.findFirst({
      where: { id: noteId, userId },
      select: { id: true },
    });
    if (!ownedNote) return false;

    await transaction.note.update({
      where: { id: noteId },
      data: {
        title: input.title,
        content: input.content,
        tags: { set: input.tagIds.map((id) => ({ id })) },
      },
    });
    return true;
  });
}

export async function deleteNoteForUser(noteId: string, userId: string) {
  const result = await prisma.note.deleteMany({ where: { id: noteId, userId } });
  return result.count > 0;
}