export default function Datenschutz() {
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
          Datenschutz
        </h1>
      </header>

      <div className="w-[95%] max-w-[800px] mx-auto py-20 md:py-32 flex flex-col gap-12">

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">1. Verantwortliche Stelle</h2>
          <p className="text-xl md:text-2xl font-black leading-snug">
            AMIGO* e.V.<br />
            Versmannstraße 66<br />
            20457 Hamburg
          </p>
          <p className="font-mono text-sm opacity-60 leading-relaxed">
            E-Mail:{' '}
            <a href="mailto:datenschutz@wirsindamigo.de" className="underline hover:opacity-100">
              datenschutz@wirsindamigo.de
            </a>
          </p>
        </section>

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
          <p className="font-mono text-sm opacity-60 leading-relaxed">
            Wir erheben personenbezogene Daten nur, wenn du uns diese freiwillig im Rahmen einer Kontaktanfrage (Raumanfrage oder Proberaum-Anfrage) mitteilst. Dies umfasst Name, E-Mail-Adresse sowie die von dir angegebenen Angaben zur Anfrage.
          </p>
        </section>

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">3. Zweck der Verarbeitung</h2>
          <p className="font-mono text-sm opacity-60 leading-relaxed">
            Deine Daten werden ausschließlich zur Bearbeitung deiner Anfrage verwendet. Eine Weitergabe an Dritte findet nicht statt.
          </p>
        </section>

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">4. Rechtsgrundlage</h2>
          <p className="font-mono text-sm opacity-60 leading-relaxed">
            Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Du kannst deine Einwilligung jederzeit per E-Mail an{' '}
            <a href="mailto:datenschutz@wirsindamigo.de" className="underline hover:opacity-100">
              datenschutz@wirsindamigo.de
            </a>{' '}
            widerrufen, ohne dass die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung berührt wird.
          </p>
        </section>

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">5. Speicherdauer</h2>
          <p className="font-mono text-sm opacity-60 leading-relaxed">
            Deine Daten werden nur so lange gespeichert, wie es zur Bearbeitung deiner Anfrage erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
          </p>
        </section>

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">6. Einbindung von Google Maps</h2>
          <p className="font-mono text-sm opacity-60 leading-relaxed">
            Diese Website verwendet Google Maps zur Darstellung einer Karte. Anbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Bei der Nutzung von Google Maps können Daten an Google-Server in den USA übertragen werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer nutzerfreundlichen Darstellung des Standorts). Weitere Informationen findest du in der{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-60">
              Datenschutzerklärung von Google
            </a>.
          </p>
        </section>

        <section className="flex flex-col gap-4 border-b-4 border-black pb-12">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">7. Deine Rechte</h2>
          <p className="font-mono text-sm opacity-60 leading-relaxed">
            Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wende dich dazu an{' '}
            <a href="mailto:datenschutz@wirsindamigo.de" className="underline hover:opacity-100">
              datenschutz@wirsindamigo.de
            </a>.
            Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">8. Keine Cookies / Tracking</h2>
          <p className="font-mono text-sm opacity-60 leading-relaxed">
            Diese Website verwendet keine Tracking-Cookies und keine Analyse-Dienste (wie Google Analytics). Es werden keine Nutzerprofile erstellt.
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
