
import React, { useMemo } from 'react';
import { BettingSignal } from '../types';
import { Calendar, CheckCircle2, XCircle, Clock, Zap, Shield } from 'lucide-react';

interface HistoryViewProps {
  signals: BettingSignal[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ signals }) => {
  const dailySignals = useMemo(() => {
    // Para simplificar no demo, filtramos os sinais gerados nas últimas 24h
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return signals.filter(s => s.fullTimestamp > dayAgo);
  }, [signals]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Histórico do Dia</h1>
          <p className="text-slate-400 text-sm">Registro de todos os sinais enviados pela IA hoje.</p>
        </div>
        <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
          <Calendar size={14} className="text-emerald-400" />
          {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {dailySignals.length > 0 ? (
        <div className="space-y-4">
          {dailySignals.map((signal, idx) => {
            const isWin = signal.status === 'WIN';
            const isLoss = signal.status === 'LOSS';
            const isPending = signal.status === 'PENDING';

            return (
              <div key={idx} className={`glass-card p-5 rounded-2xl border transition-all ${
                isWin ? 'border-emerald-500/40' : isLoss ? 'border-rose-500/40' : 'border-white/5'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isWin ? 'bg-emerald-500/20 text-emerald-400' : isLoss ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isWin && <CheckCircle2 size={24} />}
                      {isLoss && <XCircle size={24} />}
                      {isPending && <Clock size={24} className="animate-pulse" />}
                    </div>
                    <div>
                      <h3 className="font-black text-white">{signal.matchName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Shield size={10} /> {signal.leagueName}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 text-emerald-400 uppercase">
                          {signal.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:border-l md:border-white/10 md:pl-6">
                    <div className="text-center">
                      <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">HORÁRIO</span>
                      <span className="text-xs font-mono text-slate-300">{signal.timestamp}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">ODD SUG.</span>
                      <span className="text-sm font-black text-emerald-400">@{signal.oddSuggested.toFixed(2)}</span>
                    </div>
                    <div className="min-w-[80px] text-right">
                      {isWin && <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">GREEN</span>}
                      {isLoss && <span className="text-xs font-black text-rose-400 uppercase tracking-widest">RED</span>}
                      {isPending && <span className="text-xs font-black text-slate-500 uppercase tracking-widest">EM ANALISE</span>}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    <span className="font-bold text-slate-300 not-italic">Análise:</span> {signal.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 glass-card rounded-2xl border-dashed border-2 border-white/5">
          <Zap size={64} className="mx-auto mb-4 text-slate-700 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-300">Aguardando sinais...</h2>
          <p className="text-slate-500 mt-2">Assim que a IA processar jogos, o histórico aparecerá aqui.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
