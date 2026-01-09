
export interface PlayerPerformance {
  matchDate: string;
  minutesPlayed: number;
  rating: number;
  goals: number;
  assists: number;
  shots: number;
  tackles: number;
  saves: number;
  fouls: number;
  yellowCards: number;
}

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  number: number;
  lastTenGames: PlayerPerformance[];
}

export interface TeamStats {
  name: string;
  score: number;
  possession: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  corners: number;
  yellowCards: number;
  redCards: number;
  dangerousAttacks: number;
  attacks: number;
  players?: Player[];
}

export interface HistoricalMatchStats {
  date: string;
  opponent: string;
  result: 'W' | 'D' | 'L';
  score: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  cornersAgainst: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  offsides: number;
}

export interface TeamHistory {
  overall: HistoricalMatchStats[];
  specific: HistoricalMatchStats[];
}

export interface PreMatchData {
  homeForm: ('W' | 'D' | 'L')[];
  awayForm: ('W' | 'D' | 'L')[];
  leaguePosition: { home: number; away: number };
  h2h: { homeWins: number; draws: number; awayWins: number };
  avgGoals: { home: number; away: number };
  avgCorners: { home: number; away: number };
  homeHistory?: TeamHistory;
  awayHistory?: TeamHistory;
}

export interface Match {
  id: string;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  minute: number;
  league: string;
  status: 'LIVE' | 'FINISHED' | 'SCHEDULED';
  scheduledTime?: string;
  preMatch?: PreMatchData;
}

export interface BettingSignal {
  matchId: string;
  type: 'CORNER' | 'GOAL' | 'CARDS' | 'RESULT';
  description: string;
  confidence: number;
  oddSuggested: number;
  timestamp: string;
  fullTimestamp: number; // Para ordenação e expiração
  analysis: string;
  status: 'PENDING' | 'WIN' | 'LOSS';
  keyFactors?: string[];
  matchName?: string;
  leagueName?: string;
  minute?: number;
}

export interface TicketSelection {
  matchName: string;
  market: string;
  odd: number;
}

export interface ReadyTicket {
  id: string;
  type: 'SAFE' | 'MODERATE' | 'AGGRESSIVE';
  totalOdd: number;
  confidence: number;
  selections: TicketSelection[];
  analysis: string;
  timestamp: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  SIGNALS = 'SIGNALS',
  LIVE_SIGNALS = 'LIVE_SIGNALS',
  DETAILS = 'DETAILS',
  TICKETS = 'TICKETS',
  HISTORY = 'HISTORY',
  STATS = 'STATS',
  PRE_MATCH = 'PRE_MATCH'
}
