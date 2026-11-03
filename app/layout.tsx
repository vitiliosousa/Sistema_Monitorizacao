import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AvisoSemDados } from "@/components/AvisoSemDados";
import { MonitorProvider } from "@/components/MonitorProvider";
import { Navegacao } from "@/components/Navegacao";
import { PainelDemo } from "@/components/PainelDemo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monitorização do sistema híbrido de energia",
  description: "Painel de monitorização das renováveis, bateria e EDM",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MonitorProvider>
          <Navegacao />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            <AvisoSemDados />
            {children}
          </main>
          <PainelDemo />
        </MonitorProvider>
      </body>
    </html>
  );
}
