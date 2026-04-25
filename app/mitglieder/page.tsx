const links: { label: string; url: string; description?: string }[] = [
  // TODO: hier die internen Links eintragen
  // { label: 'Beispiel-Ressource', url: 'https://...', description: 'Kurze Beschreibung' },
];

export default function MitgliederPage() {
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
          Mitglieder
        </h1>
        <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-50 mt-6">
          Interne Ressourcen
        </p>
      </header>

      <div className="w-[95%] max-w-[800px] mx-auto py-20 md:py-32 flex flex-col gap-12">
        {links.length === 0 && (
          <p className="font-mono text-sm opacity-50 tracking-widest uppercase">
            Noch keine Links hinterlegt.
          </p>
        )}

        {links.map(({ label, url, description }) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 border-b-4 border-black pb-8 hover:opacity-60 transition-opacity"
          >
            <span className="text-2xl md:text-4xl font-black italic tracking-tighter leading-none">
              {label}
            </span>
            {description && (
              <span className="font-mono text-sm opacity-60 leading-relaxed">{description}</span>
            )}
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">
              {new URL(url).hostname} ↗
            </span>
          </a>
        ))}

        <form action="/api/mitglieder/logout" method="POST" className="pt-12">
          <button
            type="submit"
            className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity"
          >
            Ausloggen
          </button>
        </form>
      </div>

      <footer className="bg-black text-white px-8 md:px-20 py-8 border-t-4 border-white/20">
        <p className="font-mono text-[10px] tracking-widest uppercase opacity-40">
          Quarterpipe Hamburg // Versmannstraße 66
        </p>
      </footer>
    </main>
  );
}
