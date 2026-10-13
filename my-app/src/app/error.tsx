'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center justify-center p-6 bg-neo-bg">
      <div className="w-full max-w-lg border-4 border-black bg-white p-8 shadow-neo-lg">
        <h1 className="text-2xl font-black uppercase">Something went wrong</h1>
        <p className="mt-2 font-semibold text-zinc-700">
          The page could not be loaded. You can retry the request.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 border-4 border-black bg-neo-yellow px-5 py-3 font-black uppercase shadow-neo-sm"
        >
          Try again
        </button>
      </div>
    </section>
  );
}