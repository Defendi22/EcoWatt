import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoEnergia – Monitor de Consumo Elétrico",
  description:
    "Acompanhe sua conta de energia, compare com a média nacional e regional brasileira e contribua para a economia de energia.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-900 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
