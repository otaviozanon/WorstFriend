"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";

export default function RulesModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-all duration-200 touch-target z-40"
      >
        <BookOpen size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-surface/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-surface-raised border border-border p-6 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">Regras do Jogo</h2>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary transition-colors touch-target">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-text-secondary">
              <div>
                <h3 className="font-bold text-brand-light mb-1">Objetivo</h3>
                <p>Seja o primeiro a acumular o numero de cartas definido (4, 5 ou 7) para ser coroado o <strong>Amigo de Merda</strong>.</p>
              </div>

              <div>
                <h3 className="font-bold text-brand-light mb-1">Como Jogar</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>O sistema revela uma carta com uma pergunta.</li>
                  <li>Todos tem <strong>5 segundos</strong> para votar em quem melhor se encaixa na pergunta.</li>
                  <li>NAO pode votar em si mesmo.</li>
                  <li>Votos sao secretos ate o fim do tempo.</li>
                  <li>Quem nao votar no prazo, perde o voto.</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold text-brand-light mb-1">Pontuacao</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>O jogador mais votado ganha a carta.</li>
                  <li>Empate: ninguem ganha a carta.</li>
                  <li>Primeiro a atingir o numero de cartas definido vence.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
