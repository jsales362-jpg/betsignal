
import React from 'react';
import { ReadyTicket } from '../types';
import { Ticket, TrendingUp, ShieldCheck, Zap, AlertTriangle, Clock, ChevronRight, AlertCircle } from 'lucide-react';

interface ReadyTicketsFeedProps {
  tickets: ReadyTicket[];
  onGenerate: () => void;
  isLoading: boolean;
  error?: string | null;
}

const ReadyTicketsFeed: React.FC<ReadyTicketsFeedProps> = ({ tickets, onGenerate, isLoading, error }) => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'SAFE':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          icon: <ShieldCheck size={16} />,
          label: 'CONSERVADOR'
        };
      case 'MODERATE':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          icon: <Zap size={16} />,
          label: 'MODERADO'
        };
      case 'AGGRESSIVE':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          icon: <AlertTriangle size={16} />,
          label: 'AGRESSIVO'
        };
      default:
        return { bg: 'bg-slate-800', border: 'border-white/10', text: 'text-white', icon: null, label: '' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            Bilhetes Prontos <Ticket className="text-emerald-400" />
          </h2>
          <p className="text-slate-400 text-sm">Combinações estratégicas geradas por IA a partir dos dados ao vivo.</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ANALISANDO...
            </span>
          ) : (
            <>
              <Zap size={18} fill="currentColor" /> GERAR NOVOS BILHETES
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-rose-500/20 p-3 rounded-full text-rose-400">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-rose-400 font-bold mb-1">Limite Temporário Atingido</h4>
            <p className="text-rose-100/70 text-sm">{error}</p>
          </div>
          <button 
            onClick={onGenerate}
            className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-400 transition-colors"
          >
            Tentar Agora
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => {
          const styles = getTypeStyles(ticket.type);
          return (
            <div 
              key={ticket.id}
              className={`glass-card rounded-2xl border-t-4 transition-all hover:scale-[1.02] ${styles.border} flex flex-col`}
            >
              <div className="p-5 border-b border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <div className={`flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-lg ${styles.bg} ${styles.text}`}>
                    {styles.icon} {styles.label}
                  </div>
                  <div className="text-slate-500 text-[10px] flex items-center gap-1 font-mono">
                    <Clock size={10} /> {ticket.timestamp}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-black uppercase tracking-widest block mb-1">ODD TOTAL</span>
                    <div className="text-4xl font-black text-white">@{ticket.totalOdd.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-black uppercase tracking-widest block mb-1">CONFIANÇA</span>
                    <div className={`text-xl font-black ${styles.text}`}>
                      {Math.round(ticket.confidence * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-grow">
                <div className="space-y-3">
                  {ticket.selections.map((sel, idx) => (
                    <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-white/5 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-1 relative z-10">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">SELEÇÃO {idx + 1}</span>
                        <span className="text-xs font-black text-white">@{sel.odd.toFixed(2)}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mb-1 relative z-10">{sel.matchName}</h4>
                      <p className="text-[11px] text-slate-400 relative z-10">{sel.market}</p>
                      <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500 transform translate-x-full group-hover:translate-x-0 transition-transform"></div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">POR QUE ESTE BILHETE?</h5>
                  <p className="text-[11px] text-slate-300 italic leading-relaxed">
                    "{ticket.analysis}"
                  </p>
                </div>
              </div>

              <div className="p-5 bg-white/5">
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2">
                  COPIAR BILHETE <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tickets.length === 0 && !isLoading && !error && (
        <div className="text-center py-20 glass-card rounded-2xl border-dashed border-2 border-white/5">
          <Ticket size={48} className="mx-auto mb-4 text-slate-700" />
          <h3 className="text-xl font-bold text-slate-300">Nenhum bilhete gerado</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            Clique no botão acima para que nossa IA analise os jogos ao vivo e crie combinações estratégicas para você.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReadyTicketsFeed;
