import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function CountdownWidget({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        clearInterval(interval);
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ d, h, m, s });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;

  return (
    <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/50 shadow-inner">
      <Clock size={14} className="text-emerald-400" />
      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
        <span className="text-slate-400">Tutup:</span>
        {timeLeft ? (
          <span className="text-emerald-400">
            {timeLeft.d}H : {timeLeft.h.toString().padStart(2, '0')}J : {timeLeft.m.toString().padStart(2, '0')}M : {timeLeft.s.toString().padStart(2, '0')}D
          </span>
        ) : (
          <span className="text-slate-500">Menghitung...</span>
        )}
      </div>
    </div>
  );
}
