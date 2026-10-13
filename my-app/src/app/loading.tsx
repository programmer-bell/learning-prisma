export default function Loading() {
  return (
    <section role="status" aria-label="Loading page" className="flex flex-1 items-center justify-center p-6 bg-neo-bg">
      <div className="border-4 border-black bg-white px-8 py-6 font-black uppercase shadow-neo-md">
        Loading...
      </div>
    </section>
  );
}