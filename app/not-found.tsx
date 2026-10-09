import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-mocha px-6 text-center text-white">
      <div>
        <p className="text-sm font-semibold tracking-[0.28em] text-white/60 uppercase">
          edrisa
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Page not found
        </h1>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold underline decoration-white/40 underline-offset-4"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
