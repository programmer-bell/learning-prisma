'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteNote } from '../app/actions/notes';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteButton({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      setError(null);
      startTransition(async () => {
        try {
          const result = await deleteNote(noteId);
          if (!result.success) {
            setError(result.error ?? 'Failed to delete note.');
            return;
          }
          router.push('/dashboard');
          router.refresh();
        } catch {
          setError('Failed to delete note. Please try again.');
        }
      });
    }
  };

  return (
    <div className="flex-1">
    <Button
      variant="pink"
      size="sm"
      className="flex-1 text-xs py-1 flex items-center justify-center gap-1.5"
      onClick={handleDelete}
      loading={isPending}
    >
      {!isPending && <Trash2 className="h-3.5 w-3.5" />}
      Delete
    </Button>
      {error && <p role="alert" className="mt-2 text-xs font-bold text-red-700">{error}</p>}
    </div>
  );
}
