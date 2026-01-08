
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

export async function generateBettingSignals(match: Match): Promise<BettingSignal[]> {
  const preMatchContext = match.preMatch ? `
    CONTEXTO PRÉ-JOGO:
    - Forma ${match.homeTeam.name}: ${match.preMatch.homeForm.join(', ')} (Posição: ${match.preMatch.leaguePosition.home})
    - Forma ${match.awayTeam.name}: ${match.preMatch.awayForm.join(', ')} (Posição: ${match.preMatch.leaguePosition.away})
    - H2H Histórico: ${match.preMatch.h2h.homeWins}V ${match.homeTeam.name}, ${match.preMatch.h2h.draws}E, ${match.preMatch.h2h.awayWins}V ${match.awayTeam.name}
    - Médias Históricas: Gols (${match.preMatch.avgGoals.home}/${match.preMatch.avgGoals.away}), Cantos (${match.preMatch.avgCorners.home}/${match.preMatch.avgCorners.away})
  ` : '';

  const prompt = `
    Analise os dados estatísticos deste jogo de futebol ao vivo E o contexto histórico para gerar 1 ou 2 sinais de apostas prováveis.
    
    DADOS AO VIVO:
    Jogo: ${match.homeTeam.name} (${match.homeTeam.score}) vs ${match.awayTeam.name} (${match.awayTeam.score})
    Minuto: ${match.minute}'
    Liga: ${match.league}
    
    Estatísticas ${match.homeTeam.name}:
    - Posse: ${match.homeTeam.possession}%
    - Chutes no Gol: ${match.homeTeam.shotsOnTarget}
    - Escanteios: ${match.homeTeam.corners}
    - Ataques Perigosos: ${match.homeTeam.dangerousAttacks}
    
    Estatísticas ${match.awayTeam.name}:
    - Posse: ${match.awayTeam.possession}%
    - Chutes no Gol: ${match.awayTeam.shotsOnTarget}
    - Escanteios: ${match.awayTeam.corners}
    - Ataques Perigosos: ${match.awayTeam.dangerousAttacks}
    
    ${preMatchContext}

    Para cada sinal, forneça:
    1. Descrição clara do mercado.
    2. Análise textual combinando dados ao vivo com tendência histórica.
    3. Lista de 3 a 4 "fatores chave".
  `;

  return safeApiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Usando Flash para sinais automáticos (maior cota)
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              matchId: { type: Type.STRING },
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
      matchId: match.id,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    }));
  }).catch(err => {
    console.error("Erro final ao gerar sinais:", err);
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
