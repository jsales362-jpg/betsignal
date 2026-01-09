
import React from 'react';
import { ReadyTicket } from '../types';
import { Ticket, TrendingUp, ShieldCheck, Zap, AlertTriangle, Clock, ChevronRight, Award } from 'lucide-react';

interface ReadyTicketsFeedProps {
  tickets: ReadyTicket[];
  onGenerate: () => void;
  isLoading: boolean;
  error?: string | null;
}

const ReadyTicketsFeed: React.FC<ReadyTicketsFeedProps> = ({ tickets, onGenerate, isLoading, error }) => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'SAFE': return { text: 'text-emerald-400', icon: <ShieldCheck size={16} />, label: 'ELITE SAFE' };
      case 'MODERATE': return { text: 'text-blue-400', icon: <Zap size={16} />, label: 'MODERADO' };
      case 'AGGRESSIVE': return { text: 'text-amber-500', icon: <AlertTriangle size={16} />, label: 'AGGRESSIVE PRO' };
      default: return { text: 'text-white', icon: null, label: '' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            Bilhetes Prontos <Award className="text-emerald-400" />
          </h2>
          <p className="text-slate-400 text-sm italic">Múltiplas estratégicas geradas por IA em tempo real.</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 uppercase tracking-widest"
        >
          {isLoading ? 'ANALISANDO MERCADO...' : 'GERAR NOVOS BILHETES'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tickets.map((ticket) => {
          const styles = getTypeStyles(ticket.type);
          return (
            <div key={ticket.id} className="ticket-serrated rounded-t-3xl overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 pb-4 relative">
                <div className="flex justify-between items-center mb-6">
                  <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${styles.text}`}>
                    {styles.icon} {styles.label}
                  </div>
                  <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {ticket.timestamp}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block mb-1">Odd Total</span>
                    <div className="text-5xl font-black text-white tracking-tighter">@{ticket.totalOdd.toFixed(2)}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-center">
                    <span className="text-[8px] text-slate-500 font-black block uppercase mb-0.5">Assertiv.</span>
                    <span className={`text-sm font-black ${styles.text}`}>{Math.round(ticket.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="dotted-divider mx-6"></div>

              <div className="p-6 space-y-4 flex-grow">
                {ticket.selections.map((sel, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div>
                      <h4 className="text-[11px] font-black text-white mb-0.5 group-hover:text-emerald-400 transition-colors">{sel.matchName}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">{sel.market}</p>
                    </div>
                    <div className="text-xs font-black text-white bg-slate-800 px-2 py-1 rounded">@{sel.odd.toFixed(2)}</div>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t border-white/5">
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    <span className="font-black text-slate-300 not-italic uppercase tracking-widest mr-1">Análise IA:</span>
                    "{ticket.analysis}"
                  </p>
                </div>
              </div>

              <div className="p-6 mt-auto">
                <button className="w-full bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-emerald-500/20">
                  COPIAR CÓDIGO DO BILHETE
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReadyTicketsFeed;
