export default function Impressum() {
  return (
    <main className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">

      <header className="bg-black text-white px-8 md:px-20 py-12 md:py-16 border-b-[16px] border-white">
        <a
          href="/"
          className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-50 hover:opacity-100 transition-opacity inline-block mb-8"
        >
          ← Zurück
        </a>
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
          Impressum
        </h1>
      </header>

      <div className="w-[95%] max-w-[800px] mx-auto py-20 md:py-32 flex flex-col gap-12">

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">Angaben gemäß § 5 TMG</h2>
          <p className="text-xl md:text-2xl font-black leading-snug">
            [Name oder Organisation]<br />
            Versmannstraße 66<br />
            20457 Hamburg
          </p>
        </section>

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">Kontakt</h2>
          <p className="text-xl md:text-2xl font-black leading-snug">
            E-Mail: [email@beispiel.de]
          </p>
        </section>

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">Verantwortlich für den Inhalt</h2>
          <p className="text-xl md:text-2xl font-black leading-snug">
            [Name, Adresse wie oben]
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">Haftungsausschluss</h2>
          <p className="font-mono text-sm leading-relaxed opacity-60">
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
          </p>
        </section>

      </div>

      <footer className="bg-black text-white px-8 md:px-20 py-8 border-t-4 border-white/20">
        <p className="font-mono text-[10px] tracking-widest uppercase opacity-40">
          Quarterpipe Hamburg // Versmannstraße 66
        </p>
      </footer>

    </main>
  );
}
