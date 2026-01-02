import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, MoreVertical, Share } from 'lucide-react';

export const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isApp, setIsApp] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect Standalone Mode (Already Installed)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isInStandaloneMode) {
      setIsApp(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for PWA install event (Android/Desktop)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("PWA Install event captured");
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleClick = () => {
    if (deferredPrompt) {
      // Try native install
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      // Fallback to manual instructions
      setShowManualInstructions(true);
    }
  };

  if (isApp) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 border border-white/50 px-4 py-2 rounded-full shadow-lg shadow-cyan-500/20 text-xs font-bold text-white hover:scale-105 transition-all animate-bounce-slow"
      >
        <Smartphone size={16} />
        <span>Instalar App</span>
      </button>

      {/* Manual Install Modal */}
      {showManualInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/90 border border-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowManualInstructions(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-black text-blue-900 mb-4 text-center">Como Instalar</h3>
            
            <div className="space-y-4 text-sm text-blue-800">
              <p className="font-medium text-center">
                O navegador não permitiu a instalação automática. Faça manualmente:
              </p>

              {isIOS ? (
                // iOS Instructions
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Toque no botão <strong>Compartilhar</strong> <Share size={14} className="inline"/> na barra inferior.</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                    <li>Confirme tocando em <strong>Adicionar</strong>.</li>
                  </ol>
                </div>
              ) : (
                // Android/Chrome Instructions
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Se estiver em um editor online, abra este site em uma <strong>Nova Aba</strong>.</li>
                    <li>Toque nos <strong>três pontinhos</strong> <MoreVertical size={14} className="inline"/> no canto superior do navegador.</li>
                    <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  </ol>
                </div>
              )}
            </div>

            <button
               onClick={() => setShowManualInstructions(false)}
               className="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};