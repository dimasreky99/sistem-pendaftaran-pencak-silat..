import React from "react";
import { Athlete } from "../types";
import { FileText } from "lucide-react";

interface RekapKontingenProps {
  athletes: Athlete[];
}

export default function RekapKontingen({ athletes }: RekapKontingenProps) {
  const rekapMap: Record<string, { putra: string[]; putri: string[] }> = {};

  athletes.forEach(a => {
    const key = `${a.kategori} - ${a.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "")}`;
    if (!rekapMap[key]) rekapMap[key] = { putra: [], putri: [] };
    if (a.jk === "Putra") {
      rekapMap[key].putra.push(a.name);
    } else if (a.jk === "Putri") {
      rekapMap[key].putri.push(a.name);
    }
  });

  const sortedKeys = Object.keys(rekapMap).sort();

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-5xl mx-auto shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
          <FileText size={24} />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Rekap Kelas & Kategori</h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Daftar nama atlet berdasarkan kategori dan kelas yang diikuti.</p>
        </div>
      </div>

      {sortedKeys.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-medium">Belum ada data atlet didaftarkan.</div>
      ) : (
        <div className="space-y-6">
          {sortedKeys.map((key) => {
            const data = rekapMap[key];
            return (
              <div key={key} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">{key}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Putra */}
                  <div>
                    <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Putra
                    </h4>
                    {data.putra.length > 0 ? (
                      <ul className="space-y-2">
                        {data.putra.map((name, idx) => (
                          <li key={idx} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                            {idx + 1}. {name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Tidak ada atlet putra.</p>
                    )}
                  </div>
                  
                  {/* Putri */}
                  <div>
                    <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Putri
                    </h4>
                    {data.putri.length > 0 ? (
                      <ul className="space-y-2">
                        {data.putri.map((name, idx) => (
                          <li key={idx} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                            {idx + 1}. {name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Tidak ada atlet putri.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
