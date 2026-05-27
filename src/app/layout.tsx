import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "BetterMe — Performance Hub",
  description: "Sistema pessoal de calistenia, nutrição e BI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BetterMe",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-geist: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
            --font-instrument: 'Instrument Serif', ui-serif, Georgia, serif;
          }
        `}</style>
      </head>
      <body className="min-h-dvh font-sans">
        <main className="relative z-10 mx-auto max-w-md pt-safe" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
