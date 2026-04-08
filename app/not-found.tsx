export default function NotFound() {
  return (
    <main className="w-full min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center selection:bg-white selection:text-black px-8">
      <p className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40 mb-6">
        404 — Seite nicht gefunden
      </p>
      <h1 className="text-6xl md:text-[10rem] font-black italic tracking-tighter leading-none text-center mb-8">
        Sackgasse.
      </h1>
      <a
        href="/"
        className="border-2 border-white px-8 py-4 font-black italic text-lg hover:bg-white hover:text-black transition-all"
      >
        Zurück zur Startseite
      </a>
    </main>
  );
}
