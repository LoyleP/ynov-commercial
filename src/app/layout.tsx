import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { fr } from "@/messages/fr";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: fr.app.name, template: `%s · ${fr.app.name}` },
  description: fr.app.description,
  robots: { index: false, follow: false },
  icons: {
    icon: [
      {
        url: "/icons/favicon-y-n.png",
        type: "image/png",
        sizes: "100x100",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/favicon-y-w.png",
        type: "image/png",
        sizes: "100x100",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
