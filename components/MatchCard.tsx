
import React, { useState } from 'react';
import { Match } from '../types';
import { Shield, Flame, Snowflake, Thermometer, Zap, Activity, ChevronRight, BarChart2, Target } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
}

interface StatItem {
  label: string;
  value: number | string;
}

/**
 * Componente StatMini refatorado para aceitar um array dinâmico de estatísticas.
 */
const StatMini: React.FC<{ stats: StatItem[] }> = ({ stats }) => (
  <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/5">
    {stats.map((stat, index) => (
      <div key={index} className="text-center">
        <div className="text-xs font-black text-white">{stat.value}</div>
        <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
      </div>
    ))}
  </div>
);

/**
 * Barra de progresso comparativa para estatísticas rápidas.
 */
const QuickStatBar: React.FC<{ label: string; home: number; away: number }> = ({ label, home, away }) => {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1 px-1">
        <span className="text-emerald-400">{home}</span>
        <span className="text-slate-500">{label}</span>
        <span className="text-blue-400">{away}</span>
      </div>
      <div className="h-1 w-full bg-slate-900 rounded-full flex overflow-hidden ring-1 ring-white/5">
        <div 
          className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-500" 
          style={{ width: `${homePct}%` }}
        ></div>
        <div 
          className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-500" 
          style={{ width: `${100 - homePct}%` }}
        ></div>
      </div>
    </div>
  );
};

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const [showQuickStats, setShowQuickStats] = useState(false);

  const getThermalStatus = () => {
    const min = Math.max(1, match.minute);
    const totalDA = match.homeTeam.dangerousAttacks + match.awayTeam.dangerousAttacks;
    const heatScore = totalDA / min;

    if (heatScore > 1.8) return { label: 'SUPER QUENTE', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', icon: <Flame size={14} className="animate-bounce" /> };
    if (heatScore > 1.2) return { label: 'QUENTE', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/40', icon: <Flame size={14} className="animate-pulse" /> };
    if (heatScore > 0.4) return { label: 'MORNO', color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-white/10', icon: <Thermometer size={14} /> };
    return { label: 'FRIO', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Snowflake size={14} /> };
  };

  const thermal = getThermalStatus();
  const isHot = thermal.label === 'SUPER QUENTE' || thermal.label === 'QUENTE';

  const toggleQuickStats = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickStats(!showQuickStats);
  };

  return (
    <div 
      onClick={() => onClick(match)}
      className={`glass-card p-5 rounded-3xl cursor-pointer hover:bg-slate-800/80 transition-all duration-500 border ${thermal.border} group relative overflow-hidden flex flex-col ${showQuickStats ? 'ring-1 ring-emerald-500/20' : ''}`}
    >
      {/* Background Glow Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-10 transition-colors ${thermal.color.replace('text', 'bg')} ${isHot ? 'signal-pulse' : ''}`}></div>

      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Shield size={12} className="text-slate-600" /> {match.league}
        </span>
        <div className="flex items-center gap-2">
          {/* Botão de Resumo Expandível */}
          <button 
            onClick={toggleQuickStats}
            className={`p-1.5 rounded-lg transition-all ${showQuickStats ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-800/50 text-slate-500 hover:text-white border border-white/5'}`}
            title="Resumo Rápido de Estatísticas"
          >
            <BarChart2 size={12} />
          </button>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${thermal.bg} ${thermal.border} ${thermal.color} text-[8px] font-black tracking-widest`}>
            {thermal.icon} {thermal.label}
          </div>
        </div>
      </div>

      {/* Score Section */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex-1 text-center">
          <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/10 group-hover:border-emerald-500/30 transition-all">
            <span className="text-sm font-black text-white">{match.homeTeam.name.substring(0, 3).toUpperCase()}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase truncate">{match.homeTeam.name}</div>
        </div>

        <div className="px-4 text-center">
          <div className="text-4xl font-black text-white tracking-tighter mb-1">
            {match.homeTeam.score}<span className="text-slate-600 mx-1">:</span>{match.awayTeam.score}
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black animate-pulse">
            {match.minute}'
          </div>
        </div>

        <div className="flex-1 text-center">
          <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/10 group-hover:border-emerald-500/30 transition-all">
            <span className="text-sm font-black text-white">{match.awayTeam.name.substring(0, 3).toUpperCase()}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase truncate">{match.awayTeam.name}</div>
        </div>
      </div>

      <div className="space-y-4 relative z-10 flex-grow">
        <div className="flex items-center justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
          <span>Momentum</span>
          <span className="text-emerald-500 flex items-center gap-1">
            <Activity size={10} /> Alta Pressão
          </span>
        </div>
        <div className="flex gap-1 h-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all duration-700 ${
                i < 8 ? 'bg-emerald-500/40' : i === 8 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>

        {/* Estatísticas resumidas dinâmicas */}
        <StatMini stats={[
          { label: "Cantos", value: match.homeTeam.corners + match.awayTeam.corners },
          { label: "Chutes", value: match.homeTeam.shotsOnTarget + match.awayTeam.shotsOnTarget },
          { label: "Ataques", value: match.homeTeam.dangerousAttacks + match.awayTeam.dangerousAttacks }
        ]} />

        {/* Resumo Expandível Detalhado */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showQuickStats ? 'max-h-56 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-1">
            <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Target size={12} /> Live Insights
            </h4>
            <QuickStatBar label="Chutes no Alvo" home={match.homeTeam.shotsOnTarget} away={match.awayTeam.shotsOnTarget} />
            <QuickStatBar label="Ataques Perigosos" home={match.homeTeam.dangerousAttacks} away={match.awayTeam.dangerousAttacks} />
            <QuickStatBar label="Escanteios" home={match.homeTeam.corners} away={match.awayTeam.corners} />
            <QuickStatBar label="Posse de Bola (%)" home={match.homeTeam.possession} away={match.awayTeam.possession} />
          </div>
        </div>

        {/* Botão Analisar Partida - Navega para Detalhes */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick(match);
          }}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]"
        >
          Analisar Partida <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
