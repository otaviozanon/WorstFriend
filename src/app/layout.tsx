import type { Metadata } from "next";
import RootLayoutClient from "./root-layout-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorstFriend - Amigos de M*",
  description: "O jogo que vai destruir suas amizades",
  icons: { icon: "/poop.svg", shortcut: "/poop.svg", apple: "/poop.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body className="bg-surface text-text-primary min-h-dvh">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
