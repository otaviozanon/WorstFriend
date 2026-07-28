"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export default function RulesModal() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 rounded-full bg-surface-raised border border-border flex items-center gap-2 px-4 py-2 text-text-muted hover:text-text-primary hover:border-brand/30 transition-all duration-200 touch-target z-40"
      >
        <BookOpen size={20} />
        <span className="text-sm font-medium">{t.rules.button}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-surface/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-surface-raised border border-border p-6 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">
                {t.rules.title}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors touch-target"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-text-secondary">
              <div>
                <h3 className="font-bold text-brand-light mb-1">
                  {t.rules.objective.title}
                </h3>
                <p>{t.rules.objective.content}</p>
              </div>

              <div>
                <h3 className="font-bold text-brand-light mb-1">
                  {t.rules.howToPlay.title}
                </h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>{t.rules.howToPlay.step1}</li>
                  <li>{t.rules.howToPlay.step2}</li>
                  <li>{t.rules.howToPlay.step3}</li>
                  <li>{t.rules.howToPlay.step4}</li>
                  <li>{t.rules.howToPlay.step5}</li>
                  <li>{t.rules.howToPlay.step6}</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold text-brand-light mb-1">
                  {t.rules.endGame.title}
                </h3>
                <p>{t.rules.endGame.content}</p>
              </div>

              <div>
                <h3 className="font-bold text-brand-light mb-1">
                  {t.rules.tips.title}
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t.rules.tips.tip1}</li>
                  <li>{t.rules.tips.tip2}</li>
                  <li>{t.rules.tips.tip3}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
