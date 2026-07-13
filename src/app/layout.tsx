import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorstFriend - Amigos de Merda",
  description: "O jogo que vai destruir suas amizades",
  icons: { icon: "/crown.svg", shortcut: "/crown.svg", apple: "/crown.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body className="bg-surface text-text-primary min-h-dvh">{children}</body>
    </html>
  );
}
