import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${anton.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}