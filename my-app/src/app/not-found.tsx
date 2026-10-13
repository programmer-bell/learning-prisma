import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center p-6 bg-neo-bg">
      <div className="w-full max-w-lg border-4 border-black bg-white p-8 text-center shadow-neo-lg">
        <p className="text-sm font-black uppercase text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-black uppercase">Page not found</h1>
        <Link
          href="/dashboard"
          className="mt-6 inline-block border-4 border-black bg-neo-green px-5 py-3 font-black uppercase shadow-neo-sm"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}