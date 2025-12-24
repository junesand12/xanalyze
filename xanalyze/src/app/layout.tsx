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
  description: "An analytics platform for Xandeum pNodes",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body
        className="antialiased min-h-screen bg-background text-foreground"
        style={{
          fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        }}
      >
        <NodesProvider>
          <main className="pb-20 sm:pb-28 relative z-10">{children}</main>
          <Dock />
          {/* Logo - bottom right (hidden on mobile) */}
          <img
            src="/logo.png"
            alt="Xanalyze"
            className="hidden sm:block fixed bottom-4 right-4 w-48 h-auto z-50 pointer-events-none select-none"
          />
        </NodesProvider>
      </body>
    </html>
  );
}
