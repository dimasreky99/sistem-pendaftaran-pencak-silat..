import React, { useState, useMemo } from "react";
import { Award, Printer, Search, Filter, AlertCircle, Trophy, Sparkles } from "lucide-react";
import { Athlete, Competitor } from "../types";

interface RekapJuaraPesertaProps {
  athletes: Athlete[];
}

interface ClassWinner {
  className: string;
  gold: Competitor | null;
  silver: Competitor | null;
  bronze1: Competitor | null;
  bronze2: Competitor | null;
  totalParticipants: number;
}

export default function RekapJuaraPeserta({ athletes }: RekapJuaraPesertaProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch event settings from local storage
  const systemSettings = useMemo(() => {
    const savedSettings = localStorage.getItem("silat_settings");
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {}
    }
    return null;
  }, []);

  const eventTitle = systemSettings?.eventTitle || "KEJUARAAN PENCAK SILAT NASIONAL";
  const logoUrl = systemSettings?.logoUrl || "";

  // Find active classes (classes with 2 or more validated athletes)
  const classCounts = useMemo(() => {
    const classMap: Record<string, number> = {};
    athletes.forEach(a => {
      if (a.isAcc) {
        const key = `${a.kategori} - ${a.jk} - ${a.kelas}`;
        classMap[key] = (classMap[key] || 0) + 1;
      }
    });
    return classMap;
  }, [athletes]);

  const sortedClasses = useMemo(() => {
    return Object.keys(classCounts)
      .filter(key => {
        const hasParticipants = classCounts[key] >= 2;
        const isDrawn = localStorage.getItem("silat_bracket_" + key) !== null;
        return hasParticipants && isDrawn;
      })
      .sort((a, b) => a.localeCompare(b));
  }, [classCounts]);

  // Helper to format class name and strip weight info (cukup kelas A, B, C, D, Dst)
  const formatClassNameClean = (className: string) => {
    const parts = className.split(" - ");
    if (parts.length < 3) return className.toUpperCase();

    const kategori = parts[0];
    const gender = parts[1] === "Putra" ? "PA" : parts[1] === "Putri" ? "PI" : parts[1];
    let rawClass = parts[2];

    let division = "PRESTASI";
    if (rawClass.toUpperCase().startsWith("PEMASALAN | ")) {
      division = "PEMASALAN";
      rawClass = rawClass.substring(12);
    } else if (rawClass.toUpperCase().startsWith("PRESTASI | ")) {
      division = "PRESTASI";
      rawClass = rawClass.substring(11);
    }

    // Regex to strip weights robustly
    let classCleaned = rawClass
      .replace(/\[[^\]]*(?:kg|weight|berat|under|over)[^\]]*\]/gi, "")
      .replace(/\([^)]*(?:kg|weight|berat|under|over)[^)]*\)/gi, "")
      .replace(/:\s*\d+(?:\s*-\s*\d+)?\s*kg/gi, "")
      .replace(/\d+(?:\s*-\s*\d+)?\s*kg/gi, "")
      .replace(/:\s*under\s*\d+/gi, "")
      .replace(/:\s*over\s*\d+/gi, "")
      .replace(/under\s*\d+/gi, "")
      .replace(/over\s*\d+/gi, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "")
      .trim();
    classCleaned = classCleaned.replace(/[-\s,|:]+$/g, "").trim();

    return `${division} - ${kategori.toUpperCase()} - ${gender.toUpperCase()} - ${classCleaned.toUpperCase()}`;
  };

  // Build list of winners from saved brackets in local storage
  const classWinners: ClassWinner[] = useMemo(() => {
    return sortedClasses.map(className => {
      const bracketKey = "silat_bracket_" + className;
      const saved = localStorage.getItem(bracketKey);
      
      let gold: Competitor | null = null;
      let silver: Competitor | null = null;
      let bronze1: Competitor | null = null;
      let bronze2: Competitor | null = null;

      if (saved) {
        try {
          const bracketData = JSON.parse(saved);
          const matches = bracketData.matches;
          const roundsCount = bracketData.roundsCount;

          if (matches && roundsCount > 0) {
            // 1. Gold & Silver from the Final Match
            const finalMatches = matches[roundsCount] || [];
            const finalMatch = finalMatches[0];
            if (finalMatch && finalMatch.winner) {
              gold = finalMatch.winner;
              if (finalMatch.p1 && finalMatch.p1.nama === finalMatch.winner.nama) {
                silver = finalMatch.p2 && !finalMatch.p2.isBye ? finalMatch.p2 : null;
              } else if (finalMatch.p2 && finalMatch.p2.nama === finalMatch.winner.nama) {
                silver = finalMatch.p1 && !finalMatch.p1.isBye ? finalMatch.p1 : null;
              }
            }

            // 2. Bronzes (Juara 3 Bersama) from Semifinal matches (roundsCount - 1)
            if (roundsCount > 1) {
              const semiMatches = matches[roundsCount - 1] || [];
              
              // Semifinal 1 (index 0)
              const semi1 = semiMatches[0];
              if (semi1 && semi1.winner) {
                if (semi1.p1 && semi1.p1.nama === semi1.winner.nama) {
                  bronze1 = semi1.p2 && !semi1.p2.isBye && !semi1.p2.isPlaceholder ? semi1.p2 : null;
                } else if (semi1.p2 && semi1.p2.nama === semi1.winner.nama) {
                  bronze1 = semi1.p1 && !semi1.p1.isBye && !semi1.p1.isPlaceholder ? semi1.p1 : null;
                }
              }

              // Semifinal 2 (index 1)
              const semi2 = semiMatches[1];
              if (semi2 && semi2.winner) {
                if (semi2.p1 && semi2.p1.nama === semi2.winner.nama) {
                  bronze2 = semi2.p2 && !semi2.p2.isBye && !semi2.p2.isPlaceholder ? semi2.p2 : null;
                } else if (semi2.p2 && semi2.p2.nama === semi2.winner.nama) {
                  bronze2 = semi2.p1 && !semi2.p1.isBye && !semi2.p1.isPlaceholder ? semi2.p1 : null;
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse bracket data for", className, e);
        }
      }

      return {
        className,
        gold,
        silver,
        bronze1,
        bronze2,
        totalParticipants: classCounts[className] || 0
      };
    });
  }, [sortedClasses, classCounts]);

  // Extract unique categories for filtering
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    classWinners.forEach(cw => {
      const cat = cw.className.split(" - ")[0];
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [classWinners]);

  // Filter winners based on search & category
  const filteredWinners = useMemo(() => {
    return classWinners.filter(cw => {
      // Filter category
      if (selectedCategory !== "ALL") {
        if (!cw.className.startsWith(selectedCategory)) return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const formattedCls = formatClassNameClean(cw.className).toLowerCase();
        const goldName = cw.gold?.nama?.toLowerCase() || "";
        const silverName = cw.silver?.nama?.toLowerCase() || "";
        const bronze1Name = cw.bronze1?.nama?.toLowerCase() || "";
        const bronze2Name = cw.bronze2?.nama?.toLowerCase() || "";

        const matchesQuery =
          formattedCls.includes(query) ||
          goldName.includes(query) ||
          silverName.includes(query) ||
          bronze1Name.includes(query) ||
          bronze2Name.includes(query);

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [classWinners, searchQuery, selectedCategory]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Rekap Juara Peserta</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <style>
          table { border-collapse: collapse; }
          th { background-color: #f1f5f9; font-weight: bold; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; padding: 6px; }
          td { border: 1px solid #cbd5e1; font-size: 11px; padding: 6px; }
          .title { font-size: 16px; font-weight: bold; text-align: center; }
          .subtitle { font-size: 12px; text-align: center; }
          .header-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="10" class="title">${eventTitle}</td></tr>
          <tr><td colspan="10" class="subtitle">REKAPITULASI DAFTAR JUARA PESERTA</td></tr>
          <tr><td colspan="10" class="subtitle">Sekretariat Pertandingan</td></tr>
          <tr><td colspan="10"></td></tr>
          <thead>
            <tr class="header-row">
              <th style="background-color: #0284c7; color: white;">NO</th>
              <th style="background-color: #0284c7; color: white;">KELAS PERTANDINGAN</th>
              <th style="background-color: #eab308; color: black;">🥇 JUARA 1 (EMAS)</th>
              <th style="background-color: #eab308; color: black;">KONTINGEN EMAS</th>
              <th style="background-color: #94a3b8; color: black;">🥈 JUARA 2 (PERAK)</th>
              <th style="background-color: #94a3b8; color: black;">KONTINGEN PERAK</th>
              <th style="background-color: #b45309; color: white;">🥉 JUARA 3 BERSAMA (1)</th>
              <th style="background-color: #b45309; color: white;">KONTINGEN PERUNGGU (1)</th>
              <th style="background-color: #b45309; color: white;">🥉 JUARA 3 BERSAMA (2)</th>
              <th style="background-color: #b45309; color: white;">KONTINGEN PERUNGGU (2)</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredWinners.forEach((cw, index) => {
      const displayClass = formatClassNameClean(cw.className);
      html += `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>${displayClass}</td>
          <td>${cw.gold ? cw.gold.nama : '—'}</td>
          <td>${cw.gold ? cw.gold.kontingen : '—'}</td>
          <td>${cw.silver ? cw.silver.nama : '—'}</td>
          <td>${cw.silver ? cw.silver.kontingen : '—'}</td>
          <td>${cw.bronze1 ? cw.bronze1.nama : '—'}</td>
          <td>${cw.bronze1 ? cw.bronze1.kontingen : '—'}</td>
          <td>${cw.bronze2 ? cw.bronze2.nama : '—'}</td>
          <td>${cw.bronze2 ? cw.bronze2.kontingen : '—'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_Juara_Peserta_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isPrinting) {
    return (
      <div className="bg-white min-h-screen p-8 text-slate-900 font-sans">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm 10mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            header, aside, footer, nav, .no-print, button, select, input {
              display: none !important;
            }
            body, html, #root {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}} />

        <div className="text-center pb-5 mb-6 flex flex-col items-center justify-center">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo Pertandingan" className="h-24 max-w-full object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-black uppercase">
              LOGO
            </div>
          )}
        </div>

        <div className="mb-4 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase no-print">
          <div>Menampilkan {filteredWinners.length} kelas tanding</div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg">Cetak</button>
            <button onClick={() => setIsPrinting(false)} className="bg-slate-200 text-slate-850 px-3 py-1.5 rounded-lg">Kembali</button>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-[10px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400">
              <th className="py-2 px-1 text-center font-black text-slate-800 border border-slate-300 w-8">NO</th>
              <th className="py-2 px-2 text-left font-black text-slate-800 border border-slate-300">KELAS PERTANDINGAN</th>
              <th className="py-2 px-2 text-left font-black text-amber-800 border border-slate-300 bg-amber-50">🥇 JUARA 1 (EMAS)</th>
              <th className="py-2 px-2 text-left font-black text-slate-700 border border-slate-300 bg-slate-50">🥈 JUARA 2 (PERAK)</th>
              <th className="py-2 px-2 text-left font-black text-amber-900 border border-slate-300 bg-amber-50/30">🥉 JUARA 3 BERSAMA</th>
            </tr>
          </thead>
          <tbody>
            {filteredWinners.map((cw, index) => {
              const displayClass = formatClassNameClean(cw.className);

              return (
                <tr key={cw.className} className="border-b border-slate-200">
                  <td className="py-2 px-1 text-center font-bold text-slate-500 border border-slate-300 bg-slate-50">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 font-extrabold text-slate-900">
                    {displayClass}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 bg-amber-50/20 text-center">
                    {cw.gold ? (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="font-bold text-slate-950">{cw.gold.nama}</div>
                        <div className="text-[8.5px] text-amber-500 font-bold uppercase mt-0.5">{cw.gold.kontingen}</div>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 bg-slate-50/20 text-center">
                    {cw.silver ? (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="font-bold text-slate-950">{cw.silver.nama}</div>
                        <div className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">{cw.silver.kontingen}</div>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 bg-amber-50/10 text-center">
                    <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                      {cw.bronze1 ? (
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="font-bold text-slate-900">{cw.bronze1.nama}</div>
                          <div className="text-[8.5px] text-amber-600 font-bold uppercase mt-0.5">{cw.bronze1.kontingen}</div>
                        </div>
                      ) : null}
                      {cw.bronze2 ? (
                        <div className="flex flex-col items-center justify-center text-center border-t border-slate-200/50 pt-1.5 w-full">
                          <div className="font-bold text-slate-900">{cw.bronze2.nama}</div>
                          <div className="text-[8.5px] text-amber-600 font-bold uppercase mt-0.5">{cw.bronze2.kontingen}</div>
                        </div>
                      ) : null}
                      {!cw.bronze1 && !cw.bronze2 && (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Official signatures block */}
        <div className="mt-16 grid grid-cols-2 text-[10px] font-bold text-center">
          <div>
            <p>Ketua Pelaksana</p>
            <div className="h-16"></div>
            <p className="border-t border-slate-950 w-36 mx-auto pt-1"></p>
          </div>
          <div>
            <p>Sekretaris Pertandingan</p>
            <div className="h-16"></div>
            <p className="border-t border-slate-950 w-36 mx-auto pt-1"></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-3 py-1 text-[9px] font-black tracking-widest uppercase inline-block mb-1">
              🏆 Sekretariat Pertandingan
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              REKAPITULASI DAFTAR JUARA PESERTA
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Daftar pemenang resmi untuk setiap kelas tanding. Juara 1 (Emas) dan Juara 2 (Perak) diambil dari finalis, sedangkan Juara 3 Bersama (Perunggu) diambil dari semifinalis yang gugur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 self-stretch md:self-auto shrink-0">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
            >
              <Printer size={16} />
              CETAK PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-950/30"
            >
              <span className="text-sm font-bold">📊</span>
              EKSPOR EXCEL
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kelas tanding, nama juara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 hover:border-slate-300 focus:border-slate-950 text-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold transition-all focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Category Dropdown */}
        <div className="w-full md:w-64 relative">
          <Filter size={14} className="absolute left-4 top-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 hover:border-slate-300 focus:border-slate-950 text-slate-700 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-bold appearance-none focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* WINNERS LIST CARDS / TABLE */}
      {filteredWinners.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mx-auto text-slate-300">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-extrabold text-slate-950 text-sm uppercase">Rekap Juara Masih Kosong</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Belum ada bagan tanding yang diselesaikan atau diisi pemenangnya oleh Admin. Selesaikan pertandingan di menu Jadwal Pertandingan untuk meng-update halaman ini.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredWinners.map((cw) => {
            const displayClass = formatClassNameClean(cw.className);
            const hasWinners = cw.gold || cw.silver || cw.bronze1 || cw.bronze2;

            return (
              <div key={cw.className} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
                {/* Class Title */}
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-tight leading-snug">
                      {displayClass}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      Total: {cw.totalParticipants} Atlet Terdaftar
                    </span>
                  </div>
                  <div className="bg-slate-100 rounded-full px-2.5 py-1 text-[8px] font-black text-slate-600 uppercase">
                    🥇 JUARA PER CEK
                  </div>
                </div>

                {!hasWinners ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold italic flex items-center justify-center gap-1.5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Sparkles size={14} className="text-amber-500" />
                    Menunggu pertandingan selesai...
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Gold Winner */}
                    {cw.gold && (
                      <div className="flex flex-col items-center justify-center text-center bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 space-y-1">
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-base shadow-sm">
                          🥇
                        </div>
                        <div className="text-[9px] font-black text-amber-700 uppercase tracking-widest leading-none">JUARA 1 (EMAS)</div>
                        <div className="text-sm font-black text-slate-900 leading-snug">{cw.gold.nama}</div>
                        <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">{cw.gold.kontingen}</div>
                      </div>
                    )}

                    {/* Silver Winner */}
                    {cw.silver && (
                      <div className="flex flex-col items-center justify-center text-center bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-1">
                        <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white text-base shadow-sm">
                          🥈
                        </div>
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">JUARA 2 (PERAK)</div>
                        <div className="text-sm font-black text-slate-900 leading-snug">{cw.silver.nama}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cw.silver.kontingen}</div>
                      </div>
                    )}

                    {/* Bronze Winners */}
                    {(cw.bronze1 || cw.bronze2) && (
                      <div className="flex flex-col items-center justify-center text-center bg-amber-900/5/30 border border-amber-900/10 rounded-2xl p-4 space-y-2">
                        <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white text-base shadow-sm">
                          🥉
                        </div>
                        <div className="text-[9px] font-black text-amber-900 uppercase tracking-widest leading-none">JUARA 3 BERSAMA (PERUNGGU)</div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                          {cw.bronze1 && (
                            <div className="flex flex-col items-center justify-center text-center pt-2 sm:pt-0">
                              <div className="text-xs font-black text-slate-900 leading-snug">{cw.bronze1.nama}</div>
                              <div className="text-[10px] font-bold text-amber-700 uppercase">{cw.bronze1.kontingen}</div>
                            </div>
                          )}
                          {cw.bronze2 && (
                            <div className="flex flex-col items-center justify-center text-center pt-2 sm:pt-0">
                              <div className="text-xs font-black text-slate-900 leading-snug">{cw.bronze2.nama}</div>
                              <div className="text-[10px] font-bold text-amber-700 uppercase">{cw.bronze2.kontingen}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
