import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, Language, TranslationKeys } from "./translations";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "pt" as Language,
      t: translations.pt as TranslationKeys,
      setLanguage: (lang: Language) =>
        set({ language: lang, t: translations[lang] as TranslationKeys }),
    }),
    {
      name: "worstfriend-language",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language] as TranslationKeys;
        }
      },
    },
  ),
);
