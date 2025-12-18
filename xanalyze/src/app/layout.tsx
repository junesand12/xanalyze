import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Dock } from "@/components/layout/Dock";
import { NodesProvider } from "@/contexts/NodesContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "XAnalyze",
  description: "A retro neo-brutalist analytics platform for Xandeum pNodes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body
        className="antialiased min-h-screen bg-background text-foreground"
        style={{
          fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        }}
      >
        <NodesProvider>
          <main className="pb-28 relative z-10">{children}</main>
          <Dock />
          {/* Logo - bottom right */}
          <img
            src="/logo.png"
            alt="Xanalyze"
            className="fixed bottom-4 right-4 w-48 h-auto z-50 pointer-events-none select-none"
          />
        </NodesProvider>
      </body>
    </html>
  );
}
