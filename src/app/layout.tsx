import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
import { AuthProvider } from '@/context/AuthProvider'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proyecto E-commerce Analytics",
  description: "Panel administrativo de control de inventario y analítica desarrollado por Leonardo Cantú",
  icons: {
    icon: "/turing.webp",
    shortcut: "/turing.webp",    
    apple: "/turing.webp"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans selection:bg-cyan-500/30`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}