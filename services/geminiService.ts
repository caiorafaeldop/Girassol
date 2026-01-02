import { GoogleGenAI, Type } from "@google/genai";
import { AiNewsItem } from "../types";

// Use environment variable or the provided hardcoded key as fallback
const apiKey = process.env.API_KEY || 'AIzaSyA7T6CIlbalkd3iEcCXgkWN_eKd1r_tWQc'; 

const ai = new GoogleGenAI({ apiKey });

export const analyzeJournalEntry = async (entry: string): Promise<string> => {
  if (!apiKey) return "Configuração de API Key necessária para análise IA.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise este diário de um usuário focado em metas para 2026.
      Seja motivador, conciso e aja como um 'Life Coach' pessoal.
      Use português do Brasil.
      Dê um feedback curto (max 3 frases) e uma sugestão prática.
      
      Diário: "${entry}"`,
    });
    
    return response.text || "Não foi possível gerar análise.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com a IA. Verifique sua conexão.";
  }
};

export const generateSubtasksAI = async (taskTitle: string): Promise<string[]> => {
  if (!apiKey) return ["Adicionar subtask manualmente"];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma lista de 3 a 5 subtarefas práticas e curtas para completar a seguinte tarefa: "${taskTitle}".
      Retorne APENAS um JSON array de strings. Nada de markdown ou explicações.
      Exemplo: ["Passo 1", "Passo 2"]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Subtask Error:", error);
    return [];
  }
};

export const fetchLatestAiNews = async (): Promise<AiNewsItem[]> => {
  if (!apiKey) return [];

  try {
    // We use gemini-3-flash-preview with googleSearch tool to get real-time info
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Pesquise as notícias mais recentes (últimas 24h a 48h) sobre Inteligência Artificial.
      Selecione as 5 mais importantes e impactantes.
      Retorne APENAS um JSON array com o seguinte formato para cada notícia:
      {
        "title": "Título da Notícia",
        "summary": "Resumo curto e direto em português (max 20 palavras)",
        "source": "Nome da Fonte",
        "date": "Data (ex: Hoje, Ontem)",
        "url": "Link para a notícia (tente extrair o link real se possível, senão deixe vazio)"
      }
      Certifique-se de que é um JSON válido. Sem markdown.`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json"
      }
    });

    const jsonStr = response.text?.trim();
    
    // Sometimes the model wraps in markdown code blocks despite instructions
    const cleanJson = jsonStr?.replace(/```json/g, '').replace(/```/g, '') || '[]';
    
    const items = JSON.parse(cleanJson);
    
    // Grounding metadata often contains the real reliable links
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    // Attempt to enrich data with grounding links if the model didn't provide good ones
    if (groundingChunks && Array.isArray(items)) {
       items.forEach((item, index) => {
          if (!item.url && groundingChunks[index]?.web?.uri) {
             item.url = groundingChunks[index].web.uri;
          }
       });
    }

    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error("Gemini News Error:", error);
    return [];
  }
};