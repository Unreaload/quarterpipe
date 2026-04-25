import { Anton, Barlow_Condensed } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const lavaArabic = localFont({
  src: "../public/fonts/Lava Arabic Regular.ttf",
  variable: "--font-lava",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const barlow = Barlow_Condensed({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

export const metadata = {
  title: "Quarterpipe Hamburg",
  description: "Skatehalle, Proberaum und Eventlocation in der Hamburger HafenCity – Teil des Amigo* Wohnprojekts.",
  openGraph: {
    title: "Quarterpipe Hamburg",
    description: "Skatehalle, Proberaum und Eventlocation in der Hamburger HafenCity – Teil des Amigo* Wohnprojekts.",
    url: "https://quarterpipe.de",
    siteName: "Quarterpipe Hamburg",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quarterpipe Hamburg",
    description: "Skatehalle, Proberaum und Eventlocation in der Hamburger HafenCity – Teil des Amigo* Wohnprojekts.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${lavaArabic.variable} ${anton.variable} ${barlow.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}