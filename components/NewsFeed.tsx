import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { AiNewsItem } from '../types';
import { fetchLatestAiNews } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { Newspaper, ExternalLink, RefreshCw, Loader2, Calendar, ArrowUpCircle } from 'lucide-react';

interface CachedNews {
  items: AiNewsItem[];
  date: string;
}

export const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<AiNewsItem[]>([]);
  const [pendingNews, setPendingNews] = useState<AiNewsItem[] | null>(null); // Notícias novas aguardando aprovação
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load from Cache immediately, then fetch background
  useEffect(() => {
    // 1. Load Cache
    const cached = StorageService.load<CachedNews | null>(StorageService.keys.NEWS_CACHE, null);
    
    if (cached && cached.items.length > 0) {
      setNews(cached.items);
      setLastUpdated(cached.date);
    }

    // 2. Trigger fetch if no cache or just to update
    fetchBackgroundNews(cached?.items.length === 0);
  }, []);

  const fetchBackgroundNews = async (forceUpdate = false) => {
    setLoading(true);
    try {
      const freshNews = await fetchLatestAiNews();
      
      if (freshNews.length > 0) {
        const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Save to cache immediately so next refresh is fast
        StorageService.save(StorageService.keys.NEWS_CACHE, { 
            items: freshNews, 
            date: nowStr 
        });

        // Decide display logic
        if (forceUpdate || news.length === 0) {
          // If empty, show immediately
          setNews(freshNews);
          setLastUpdated(nowStr);
        } else {
          // If we already have news, show button
          setPendingNews(freshNews);
        }
      }
    } catch (error) {
      console.error("Falha ao buscar notícias em background");
    } finally {
      setLoading(false);
    }
  };

  const applyPendingUpdate = () => {
    if (pendingNews) {
      setNews(pendingNews);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setPendingNews(null);
      // Ensure visual feedback scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <GlassCard 
        title="Radar IA" 
        headerAction={
          <div className="flex items-center gap-2">
            {loading && (
                 <Loader2 size={18} className="animate-spin text-blue-500" />
            )}
            <button 
                onClick={() => fetchBackgroundNews(true)} 
                disabled={loading}
                className="p-2 bg-white/50 rounded-full hover:bg-white/80 text-blue-600 transition-all active:scale-95 disabled:opacity-50"
                title="Forçar atualização"
            >
                <RefreshCw size={18} />
            </button>
          </div>
        }
      >
        <div className="mb-4 text-xs text-blue-800/70 text-center flex justify-center items-center gap-1">
            <Newspaper size={12} />
            {lastUpdated 
                ? `Atualizado às ${lastUpdated}` 
                : 'Carregando informações...'}
        </div>

        {/* Update Button Banner */}
        {pendingNews && (
            <button 
                onClick={applyPendingUpdate}
                className="w-full mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl shadow-lg flex items-center justify-center gap-2 animate-bounce-slow hover:scale-[1.02] transition-transform"
            >
                <ArrowUpCircle size={20} className="text-yellow-300" />
                <span className="font-bold text-sm">Novas notícias encontradas! Atualizar Feed</span>
            </button>
        )}

        {news.length > 0 ? (
          <div className="space-y-3">
            {news.map((item, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white/40 border border-white/60 rounded-2xl p-4 transition-all hover:bg-white/60 hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                   <h3 className="font-bold text-blue-900 leading-snug">{item.title}</h3>
                   {item.url && (
                     <a 
                       href={item.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-600 p-1"
                     >
                       <ExternalLink size={16} />
                     </a>
                   )}
                </div>
                
                <p className="text-sm text-blue-800/90 mb-3 leading-relaxed">{item.summary}</p>
                
                <div className="flex items-center justify-between text-[10px] font-bold text-blue-900/50 uppercase tracking-wider">
                    <span className="bg-yellow-100/50 px-2 py-1 rounded-md border border-yellow-200/50 text-yellow-700">
                        {item.source || "Web"}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {item.date || "Recente"}
                    </span>
                </div>
              </div>
            ))}
            
            <p className="text-[10px] text-center text-blue-900/40 mt-4 italic">
              Gerado por IA (Gemini 3.0). Verifique as fontes.
            </p>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-blue-800/60 gap-3">
             {loading ? (
                <>
                    <Loader2 size={32} className="animate-spin text-yellow-500" />
                    <p className="text-sm font-medium animate-pulse">Buscando as primeiras notícias...</p>
                </>
             ) : (
                <div className="text-center">
                    <p>Não foi possível carregar as notícias.</p>
                    <button onClick={() => fetchBackgroundNews(true)} className="text-blue-600 underline mt-2 text-sm">Tentar novamente</button>
                </div>
             )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};