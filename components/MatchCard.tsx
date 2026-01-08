
import React from 'react';
import { Match } from '../types';
import { Shield, Flame, Snowflake, Thermometer, Zap, AlertCircle } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const getThermalStatus = () => {
    const min = Math.max(1, match.minute);
    const totalDA = match.homeTeam.dangerousAttacks + match.awayTeam.dangerousAttacks;
    const totalShots = (match.homeTeam.shotsOnTarget + match.homeTeam.shotsOffTarget + 
                        match.awayTeam.shotsOnTarget + match.awayTeam.shotsOffTarget);
    
    // Score baseado em ataques perigosos e chutes por minuto
    const dpm = totalDA / min;
    const spm = totalShots / min;
    const heatScore = dpm + (spm * 2);

    if (heatScore > 1.8) return { label: 'SUPER QUENTE', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', icon: <div className="flex"><Flame size={14} className="animate-bounce" /><Flame size={14} className="animate-bounce delay-100" /></div>, glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' };
    if (heatScore > 1.2) return { label: 'QUENTE', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/40', icon: <Flame size={14} className="animate-pulse" />, glow: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]' };
    if (heatScore > 0.7) return { label: 'MEIO TERMO', color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-white/10', icon: <Thermometer size={14} />, glow: '' };
    if (heatScore > 0.4) return { label: 'FRIO', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Snowflake size={14} />, glow: '' };
    return { label: 'SUPER FRIO', color: 'text-cyan-600', bg: 'bg-cyan-600/10', border: 'border-cyan-600/20', icon: <div className="flex"><Snowflake size={14} /><Snowflake size={14} /></div>, glow: '' };
  };

  const thermal = getThermalStatus();

  return (
    <div 
      onClick={() => onClick(match)}
      className={`glass-card p-4 rounded-xl cursor-pointer hover:bg-slate-800 transition-all border-t-2 ${thermal.border} ${thermal.glow} mb-4 group relative overflow-hidden`}
    >
      {/* Background Decorativo de Temperatura */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-10 transition-colors ${thermal.color.replace('text', 'bg')}`}></div>

      <div className="flex justify-between items-center mb-3 relative z-10">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Shield size={10} className="text-slate-600" /> {match.league}
        </span>
        <div className="flex items-center gap-2">
           <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${thermal.bg} ${thermal.border} ${thermal.color} text-[9px] font-black tracking-tighter`}>
             {thermal.icon}
             {thermal.label}
           </div>
           <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            {match.minute}'
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center text-center py-2 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-2 border border-white/5 shadow-lg group-hover:border-emerald-500/30 transition-colors">
            <span className="text-sm font-black text-white">{match.homeTeam.name.substring(0, 3).toUpperCase()}</span>
          </div>
          <span className="text-[11px] font-bold truncate w-full text-slate-300">{match.homeTeam.name}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-3xl font-black text-white flex gap-1 items-center">
            <span>{match.homeTeam.score}</span>
            <span className="text-slate-600 text-xl">:</span>
            <span>{match.awayTeam.score}</span>
          </div>
          <div className="mt-1 px-2 py-0.5 bg-slate-900 rounded text-[8px] font-mono text-slate-500 border border-white/5">
            LIVE SCORE
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-2 border border-white/5 shadow-lg group-hover:border-emerald-500/30 transition-colors">
            <span className="text-sm font-black text-white">{match.awayTeam.name.substring(0, 3).toUpperCase()}</span>
          </div>
          <span className="text-[11px] font-bold truncate w-full text-slate-300">{match.awayTeam.name}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3 relative z-10">
        {/* Barra de Intensidade Visual */}
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden flex">
           <div className={`h-full transition-all duration-1000 ${thermal.color.replace('text', 'bg')}`} style={{ width: `${Math.min(100, (match.homeTeam.dangerousAttacks / Math.max(1, match.minute)) * 50)}%` }}></div>
           <div className="w-0.5 h-full bg-slate-800"></div>
           <div className={`h-full transition-all duration-1000 bg-blue-500 opacity-50`} style={{ width: `${Math.min(100, (match.awayTeam.dangerousAttacks / Math.max(1, match.minute)) * 50)}%` }}></div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-500 font-black uppercase tracking-tighter">
          <div className="flex flex-col items-center">
            <span className="text-white text-xs">{match.homeTeam.corners + match.awayTeam.corners}</span>
            <span>CANTOS</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/5">
            <span className="text-white text-xs">{match.homeTeam.shotsOnTarget + match.awayTeam.shotsOnTarget}</span>
            <span>CHUTES</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white text-xs">{match.homeTeam.dangerousAttacks + match.awayTeam.dangerousAttacks}</span>
            <span>PRESSÃO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
