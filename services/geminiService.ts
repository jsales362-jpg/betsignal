
import { GoogleGenAI, Type } from "@google/genai";
import { Match, BettingSignal, ReadyTicket } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Função utilitária para chamadas seguras à API com lógica de retry (Exponential Backoff)
 */
async function safeApiCall<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED');
    
    if (isQuotaError && retries > 0) {
      console.warn(`[Gemini API] Cota atingida. Tentando novamente em ${delay}ms... (Tentativas restantes: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeApiCall(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateBettingSignals(matches: Match[]): Promise<BettingSignal[]> {
  if (matches.length === 0) return [];

  const matchesContext = matches.map(match => {
    const preMatchContext = match.preMatch ? `
      CONTEXTO PRÉ-JOGO:
      - Forma ${match.homeTeam.name}: ${match.preMatch.homeForm.join(', ')} (Posição: ${match.preMatch.leaguePosition.home})
      - Forma ${match.awayTeam.name}: ${match.preMatch.awayForm.join(', ')} (Posição: ${match.preMatch.leaguePosition.away})
      - Médias Históricas: Gols (${match.preMatch.avgGoals.home}/${match.preMatch.avgGoals.away}), Cantos (${match.preMatch.avgCorners.home}/${match.preMatch.avgCorners.away})
    ` : '';

    return `
      DADOS AO VIVO (ID: ${match.id}):
      Jogo: ${match.homeTeam.name} (${match.homeTeam.score}) vs ${match.awayTeam.name} (${match.awayTeam.score})
      Minuto: ${match.minute}' | Liga: ${match.league}
      Estatísticas ${match.homeTeam.name}: Posse ${match.homeTeam.possession}%, Cantos ${match.homeTeam.corners}, Ataques Perigosos ${match.homeTeam.dangerousAttacks}, Chutes no Alvo ${match.homeTeam.shotsOnTarget}
      Estatísticas ${match.awayTeam.name}: Posse ${match.awayTeam.possession}%, Cantos ${match.awayTeam.corners}, Ataques Perigosos ${match.awayTeam.dangerousAttacks}, Chutes no Alvo ${match.awayTeam.shotsOnTarget}
      ${preMatchContext}
    `;
  }).join('\n---\n');

  const prompt = `
    Analise os dados estatísticos deste lote de jogos de futebol ao vivo para gerar sinais de apostas prováveis.
    Para cada jogo, você pode gerar 0, 1 ou 2 sinais dependendo da intensidade da partida.
    
    LOTE DE JOGOS:
    ${matchesContext}

    Para cada sinal gerado, forneça o ID correto da partida (matchId), o tipo de mercado, descrição, confiança (0.0 a 1.0), odd sugerida, análise detalhada e fatores chave.
  `;

  return safeApiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              matchId: { type: Type.STRING, description: "O ID da partida ao qual este sinal pertence" },
              type: { type: Type.STRING, enum: ['CORNER', 'GOAL', 'CARDS', 'RESULT'] },
              description: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              oddSuggested: { type: Type.NUMBER },
              analysis: { type: Type.STRING },
              keyFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['matchId', 'type', 'description', 'confidence', 'oddSuggested', 'analysis', 'keyFactors']
          }
        }
      }
    });

    const signals = JSON.parse(response.text || "[]") as any[];
    return signals.map(s => ({
      ...s,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    }));
  }).catch(err => {
    console.error("Erro final ao gerar sinais em lote:", err);
    return [];
  });
}

export async function generateReadyTickets(activeMatches: Match[]): Promise<ReadyTicket[]> {
  const matchesData = activeMatches.map(m => `
    - ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.minute}'): ${m.homeTeam.score}-${m.awayTeam.score}. 
      Cantos: ${m.homeTeam.corners}-${m.awayTeam.corners}. 
      Ataques Perigosos: ${m.homeTeam.dangerousAttacks}-${m.awayTeam.dangerousAttacks}.
  `).join('\n');

  const prompt = `
    Com base nos jogos de futebol ao vivo abaixo, crie 3 "Bilhetes Prontos" (combinações de 2 a 3 apostas).
    Os tipos de bilhetes devem ser: 
    1. SAFE (Conservador, Odd total baixa ~2.0, alta confiança)
    2. MODERATE (Moderado, Odd total média ~4.0)
    3. AGGRESSIVE (Arriscado, Odd total alta ~10.0+)

    JOGOS AO VIVO:
    ${matchesData}

    Retorne uma lista de bilhetes conforme o esquema JSON definido.
  `;

  return safeApiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['SAFE', 'MODERATE', 'AGGRESSIVE'] },
              totalOdd: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              selections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    matchName: { type: Type.STRING },
                    market: { type: Type.STRING },
                    odd: { type: Type.NUMBER }
                  },
                  required: ['matchName', 'market', 'odd']
                }
              },
              analysis: { type: Type.STRING }
            },
            required: ['type', 'totalOdd', 'confidence', 'selections', 'analysis']
          }
        }
      }
    });

    const tickets = JSON.parse(response.text || "[]") as any[];
    return tickets.map((t, idx) => ({
      ...t,
      id: `ticket-${Date.now()}-${idx}`,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    }));
  });
}
