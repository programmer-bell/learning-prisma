'use client';

import { useActionState, useState } from 'react';
import { createNote, updateNote } from '@/app/actions/notes';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';

type Tag = {
  id: string;
  name: string;
  color: string;
};

type Note = {
  id: string;
  title: string;
  content: string;
  tags?: { id: string }[];
};

type NoteFormProps = {
  initialNote?: Note | null;
  allTags: Tag[];
};

export function NoteForm({ initialNote, allTags }: NoteFormProps) {
  const actionToRun = initialNote ? updateNote.bind(null, initialNote.id) : createNote;

  const [state, formAction, isPending] = useActionState(actionToRun, null);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    (initialNote?.tags || []).map((tag) => tag.id)
  );

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <div role="alert" aria-live="polite" className="bg-neo-pink border-4 border-black p-3 font-bold text-sm shadow-neo-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-black shrink-0 stroke-[3]" />
          <span>{state.error}</span>
        </div>
      )}

      <Input
        label="Note Title"
        name="title"
        placeholder="e.g. Configure Prisma ORM with PostgreSQL"
        required
        maxLength={160}
        defaultValue={initialNote?.title || ''}
      />

      <TextArea
        label="Note Content"
        name="content"
        placeholder="Write your developer notes or logs here..."
        rows={8}
        required
        maxLength={20000}
        defaultValue={initialNote?.content || ''}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-black uppercase tracking-wide text-black">
          Assign Tags
        </label>
        <div className="flex flex-wrap gap-2.5">
          {allTags.map((tag) => {
            const isChecked = selectedTagIds.includes(tag.id);

            const checkedColorClass =
              tag.color === 'neo-yellow'
                ? 'peer-checked:bg-neo-yellow'
                : tag.color === 'neo-pink'
                  ? 'peer-checked:bg-neo-pink'
                  : tag.color === 'neo-green'
                    ? 'peer-checked:bg-neo-green'
                    : tag.color === 'neo-cyan'
                      ? 'peer-checked:bg-neo-cyan'
                      : 'peer-checked:bg-neo-orange peer-checked:text-white';

            return (
              <label key={tag.id} className="relative cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="tags"
                  value={tag.id}
                  checked={isChecked}
                  onChange={() => handleTagToggle(tag.id)}
                  className="sr-only peer"
                />
                <span
                  className={`inline-block px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] peer-checked:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] peer-checked:translate-x-[1px] peer-checked:translate-y-[1px] transition-all hover:bg-zinc-50 cursor-pointer ${checkedColorClass}`}
                >
                  # {tag.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <Button
        type="submit"
        variant="green"
        className="w-full flex items-center justify-center gap-2 mt-4"
        loading={isPending}
      >
        <Check className="h-5 w-5 stroke-[3]" />
        {initialNote ? 'Update Note' : 'Save Note'}
      </Button>
    </form>
  );
}
