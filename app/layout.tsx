import type { Metadata, Viewport } from "next";
import { Inter, Baskervville } from "next/font/google";
import { CookieConsentModal } from "@/components/layout/CookieConsentModal";
import { B2BSupportDock } from "@/components/layout/B2BSupportDock";
import { AIFaqAssistantModal } from "@/components/layout/AIFaqAssistantModal";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baskervville = Baskervville({
  variable: "--font-baskervville",
  subsets: ["latin"],
  weight: ["400"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1E3D" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Satriano Atelier - B2B Made-to-Order Manufacturing Portal",
  description:
    "Industrial B2B white-label garment manufacturing portal with transparent live pricing and precision CAD sizing.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Satriano Atelier",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${baskervville.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="satriano-theme-script"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.pathname;if(p.startsWith('/admin'))return;var t=localStorage.getItem('satriano-theme');if(!t){t=p.startsWith('/portal')?'dark':(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <link
          rel="apple-touch-icon"
          href="/icons/apple-touch-icon.png"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen flex flex-col antialiased bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans"
        suppressHydrationWarning
      >
        {children}
        <CookieConsentModal />
        <B2BSupportDock />
        <AIFaqAssistantModal />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

