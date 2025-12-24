import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Dock } from "@/components/layout/Dock";
import { NodesProvider } from "@/contexts/NodesContext";
import { AILogoButton } from "@/components/layout/AILogoButton";

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
        </NodesProvider>
        {/* AI Logo Button - floating bottom left (hidden on mobile) */}
        <AILogoButton />
      </body>
    </html>
  );
}
