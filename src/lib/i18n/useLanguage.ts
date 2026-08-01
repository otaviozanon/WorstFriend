import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, Language } from "./translations";

export type TFunc = typeof translations.pt;

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TFunc;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: "pt" as Language,
      t: translations.pt as TFunc,
      setLanguage: (lang: Language) =>
        set({ language: lang, t: translations[lang] as TFunc }),
    }),
    {
      name: "worstfriend-language",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language] as TFunc;
        }
      },
    },
  ),
);
