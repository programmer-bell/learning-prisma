'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createNoteForUser,
  deleteNoteForUser,
  getNoteForUser,
  listNotesForUser,
  listTags,
  noteTagsExist,
  updateNoteForUser,
} from '@/lib/note-service';
import type { NoteFilters } from '@/lib/note-query';
import { parseNoteForm } from '@/lib/validation';
import { getCurrentUser } from './auth';

type NoteActionState = { success: false; error: string } | null;

export async function getTags() {
  if (!(await getCurrentUser())) return [];
  return listTags();
}

export async function getNotes(filters: NoteFilters = {}) {
  const user = await getCurrentUser();
  if (!user) return [];

  return listNotesForUser(user.id, filters);
}

export async function getNoteById(id: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  return getNoteForUser(id, user.id);
}

export async function createNote(
  _prevState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const fields = parseNoteForm(formData);
  if ('error' in fields && fields.error) return { success: false, error: fields.error };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'You must be logged in.' };
  if (!(await noteTagsExist(fields.tagIds))) {
    return { success: false, error: 'One or more selected tags are invalid.' };
  }

  try {
    await createNoteForUser(user.id, fields);
  } catch {
    return { success: false, error: 'Failed to create note. Please try again.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateNote(
  noteId: string,
  _prevState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const fields = parseNoteForm(formData);
  if ('error' in fields && fields.error) return { success: false, error: fields.error };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'You must be logged in.' };
  if (!(await noteTagsExist(fields.tagIds))) {
    return { success: false, error: 'One or more selected tags are invalid.' };
  }

  try {
    const updated = await updateNoteForUser(noteId, user.id, fields);
    if (!updated) return { success: false, error: 'Note not found.' };
  } catch {
    return { success: false, error: 'Failed to update note. Please try again.' };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/notes/${noteId}`);
  redirect(`/dashboard/notes/${noteId}`);
}

export async function deleteNote(noteId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'You must be logged in.' };

  try {
    const deleted = await deleteNoteForUser(noteId, user.id);
    if (!deleted) {
      return { success: false, error: 'Note not found.' };
    }
  } catch {
    return { success: false, error: 'Failed to delete note. Please try again.' };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/notes/${noteId}`);
  return { success: true };
}
