export function StudioSection({ title, note }: { title: string; note: string }) {
  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-base leading-relaxed text-[#1c120e]/70">{note}</p>
    </section>
  );
}
