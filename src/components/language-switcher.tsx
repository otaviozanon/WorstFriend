"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggle = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                 bg-surface-raised border border-border
                 text-text-secondary hover:text-brand-light hover:border-brand/30
                 transition-all duration-200 touch-target text-sm font-medium"
      title={language === "pt" ? "Switch to English" : "Mudar para Português"}
    >
      <Languages size={16} />
      <span className="font-bold uppercase">{language === "pt" ? "PT" : "EN"}</span>
    </button>
  );
}
