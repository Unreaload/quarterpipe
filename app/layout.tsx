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
  description: "Movement, Creativity, and Exchange in HafenCity",
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