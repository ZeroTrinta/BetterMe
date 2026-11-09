import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
export const metadata:Metadata={
  title:"BetterMe — Calistenia & Evolução",
  description:"Acompanhe seu plano de calistenia de 12 semanas, evolução física e nutrição.",
  manifest:"/BetterMe/manifest.json",
  appleWebApp:{capable:true,statusBarStyle:"black-translucent",title:"BetterMe"}
};
export const viewport:Viewport={themeColor:"#0d1211",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="pt-BR"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <style>{":root{--font-geist:'DM Sans',ui-sans-serif,system-ui,sans-serif;--font-instrument:'DM Sans',sans-serif}"}</style>
  </head><body className="min-h-dvh bg-bg font-sans text-ink">{children}</body></html>;
}
