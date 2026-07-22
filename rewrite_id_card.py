with open('src/components/IdCardPreview.tsx', 'r') as f:
    content = f.read()

# We need to change the style of the ID Card Box.
# Background is always white. KOP Logo pressed top, left, right.
# Under KOP: Manager/Official/Pesilat label.
# Under label: Photo.
# Under Photo: Personal Data.

import re

new_component = """import React from "react";
import { Printer, ChevronLeft, Download } from "lucide-react";
import { Athlete, SystemSettings } from "../types";

interface IdCardPreviewProps {
  athlete?: Athlete | { name: string; kontingen: string; kategori: string; kelas: string; id: string; isOfficial?: boolean; officialRole?: string; photoUrl?: string };
  athletes?: (Athlete | { name: string; kontingen: string; kategori: string; kelas: string; id: string; isOfficial?: boolean; officialRole?: string; photoUrl?: string })[];
  settings: SystemSettings;
  onCancel: () => void;
  onDownloadPng?: () => void;
}

export default function IdCardPreview({
  athlete,
  athletes,
  settings,
  onCancel,
  onDownloadPng
}: IdCardPreviewProps) {
  
  const targetAthletes = athletes || (athlete ? [athlete] : []);

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-4xl mx-auto shadow-sm border border-slate-100 text-center space-y-6">
      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5 no-print">
        <button
          onClick={onCancel}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-left">
          <h2 className="font-extrabold text-slate-900 text-lg tracking-tight uppercase">
            Preview ID Card
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Cetak berkas ID Card resmi peserta turnamen.</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 py-4">
        {targetAthletes.map((tgt, idx) => {
          const isOfficial = "isOfficial" in tgt && tgt.isOfficial;
          const officialRole = "officialRole" in tgt ? tgt.officialRole : "OFFICIAL";
          
          let photoUrl = "";
          if ("photoUrl" in tgt && tgt.photoUrl) {
            photoUrl = tgt.photoUrl;
          } else if (!isOfficial && "fotos" in tgt && tgt.fotos && tgt.fotos[0]) {
            photoUrl = tgt.fotos[0];
          }

          return (
            <div 
              key={tgt.id || idx}
              id={`idCardBadgeElement-${idx}`}
              className="relative w-[300px] h-[430px] rounded-2xl overflow-hidden shadow-xl text-center flex flex-col bg-white border border-slate-200"
            >
              {/* Kop Logo pressed top/left/right */}
              {settings.logoUrl ? (
                <div className="w-full h-[60px] bg-slate-50 flex items-center justify-center border-b border-slate-200">
                  <img src={settings.logoUrl} alt="Kop Logo" className="h-[50px] w-auto max-w-full object-contain" />
                </div>
              ) : (
                <div className="w-full h-[60px] bg-slate-50 flex items-center justify-center border-b border-slate-200 p-2">
                  <h4 className="font-black text-xs text-slate-800 tracking-widest uppercase text-center leading-tight">
                    {settings.eventTitle || "SH TERATE CUP"}
                  </h4>
                </div>
              )}

              {/* Role Label */}
              <div className="py-2">
                <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                  isOfficial ? (officialRole === 'MANAGER' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isOfficial ? officialRole : "PESILAT"}
                </span>
              </div>

              {/* Foto */}
              <div className="w-[100px] h-[126px] bg-slate-100 border border-slate-300 rounded-xl mx-auto flex items-center justify-center overflow-hidden z-10 shadow-inner mt-1">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 text-[9px] font-bold p-2 uppercase leading-snug">
                    PAS FOTO<br />3X4
                  </div>
                )}
              </div>

              {/* Data Diri */}
              <div className="mt-4 px-4 flex-1 flex flex-col items-center">
                <h3 className="font-black text-sm uppercase text-slate-800 max-w-full tracking-tight leading-tight line-clamp-2">
                  {tgt.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 line-clamp-1">
                  Kontingen: {tgt.kontingen}
                </p>

                {!isOfficial && (
                  <div className="mt-3 flex items-center gap-1.5 w-full justify-center">
                    <div className="bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase px-2 py-1 rounded truncate">
                      {tgt.kategori}
                    </div>
                    <div className="bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase px-2 py-1 rounded truncate">
                      {tgt.kelas.replace(/Prestasi\s*\|\s*/, "").replace(/Pemasalan\s*\|\s*/, "")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2.5 pt-4 border-t border-slate-100 no-print max-w-md mx-auto">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/10 flex items-center justify-center gap-1.5"
        >
          <Printer size={15} /> CETAK BADGE (PDF)
        </button>
        {onDownloadPng && (
          <button
            onClick={onDownloadPng}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-blue-950/10 flex items-center justify-center gap-1.5"
          >
            <Download size={15} /> DOWNLOAD GAMBAR
          </button>
        )}
      </div>

      <p className="text-[10px] font-semibold text-slate-400 leading-normal no-print max-w-md mx-auto">
        * ID Card dicetak sesuai dengan dimensi lanyard resmi IPSI (74mm x 105mm). Pilih ukuran kertas A4 dengan orientasi Portrait dan set Skala 100% pada dialog print browser Anda.
      </p>
    </div>
  );
}
"""

with open('src/components/IdCardPreview.tsx', 'w') as f:
    f.write(new_component)
