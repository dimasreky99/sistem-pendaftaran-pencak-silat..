import React, { useState, useMemo } from "react";
import { Award, Printer, AlertCircle, Trophy, TrendingUp, Sparkles, Download, X } from "lucide-react";
import { Athlete, Competitor, Contingent } from "../types";

interface RekapJuaraUmumProps {
  athletes: Athlete[];
  contingents: Contingent[];
}

interface ContingentMedal {
  contingentName: string;
  gold: number;
  silver: number;
  bronze: number;
  goldNonMedali: number;
  silverNonMedali: number;
  total: number;
}

export default function RekapJuaraUmum({ athletes, contingents }: RekapJuaraUmumProps) {
  const [includeNonMedali, setIncludeNonMedali] = useState<boolean>(false);
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  // Fetch event settings from local storage
  const { eventTitle, logoUrl } = useMemo(() => {
    const savedSettings = localStorage.getItem("silat_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          eventTitle: parsed.eventTitle || "KEJUARAAN PENCAK SILAT NASIONAL",
          logoUrl: parsed.logoUrl || ""
        };
      } catch (e) {}
    }
    return {
      eventTitle: "KEJUARAAN PENCAK SILAT NASIONAL",
      logoUrl: ""
    };
  }, []);

  // 1. Gather all active classes (with validated athletes and brackets)
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

  // Scan both classCounts and localStorage keys to ensure all saved brackets are checked
  const activeClasses = useMemo(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("silat_bracket_")) {
        keys.push(key.replace("silat_bracket_", ""));
      }
    }
    // Ensure validated ones with brackets are captured
    Object.keys(classCounts).forEach(cl => {
      if (localStorage.getItem("silat_bracket_" + cl) !== null && !keys.includes(cl)) {
        keys.push(cl);
      }
    });
    return keys;
  }, [classCounts]);

  // Count validated athletes per contingent
  const contingentAthleteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    athletes.forEach(a => {
      if (a.isAcc && a.kontingen) {
        counts[a.kontingen] = (counts[a.kontingen] || 0) + 1;
      }
    });
    return counts;
  }, [athletes]);

  // 2. Fetch list of unique contingents (include all registered)
  const activeContingents = useMemo(() => {
    const list = new Set<string>();
    contingents.forEach(c => {
      if (c.contingentName) list.add(c.contingentName);
    });
    athletes.forEach(a => {
      if (a.isAcc && a.kontingen) {
        list.add(a.kontingen);
      }
    });
    return Array.from(list);
  }, [athletes, contingents]);

  // 3. Compute medals won by each contingent
  const medalStandings: ContingentMedal[] = useMemo(() => {
    // Initialize medal map
    const standingMap: Record<string, { gold: number; silver: number; bronze: number; goldNonMedali: number; silverNonMedali: number }> = {};
    activeContingents.forEach(name => {
      standingMap[name] = { gold: 0, silver: 0, bronze: 0, goldNonMedali: 0, silverNonMedali: 0 };
    });

    // Populate from all bracket data in local storage
    activeClasses.forEach(className => {
      const bracketKey = "silat_bracket_" + className;
      const saved = localStorage.getItem(bracketKey);
      if (!saved) return;

      try {
        const bracketData = JSON.parse(saved);
        const matches = bracketData.matches;
        const roundsCount = bracketData.roundsCount;

        if (matches && roundsCount > 0) {
          // Count participants in Round 1
          let participantCount = 0;
          const r1Matches = matches[1] || [];
          r1Matches.forEach((m: any) => {
            if (m.p1 && !m.p1.isBye && !m.p1.isPlaceholder && m.p1.nama && m.p1.nama !== "BYE") {
              participantCount++;
            }
            if (m.p2 && !m.p2.isBye && !m.p2.isPlaceholder && m.p2.nama && m.p2.nama !== "BYE") {
              participantCount++;
            }
          });

          // Check if it's considered Non-Medali (only 1 or 2 participants in bracket)
          const isNonMedaliClass = participantCount < 3;

          // Final match determines Gold & Silver
          const finalMatches = matches[roundsCount] || [];
          const finalMatch = finalMatches[0];

          if (finalMatch && finalMatch.winner) {
            const goldCont = finalMatch.winner.kontingen;
            if (standingMap[goldCont]) {
              if (isNonMedaliClass) {
                standingMap[goldCont].goldNonMedali += 1;
              } else {
                standingMap[goldCont].gold += 1;
              }
            }

            let silverCont: string | null = null;
            if (finalMatch.p1 && finalMatch.p1.nama === finalMatch.winner.nama && finalMatch.p2 && !finalMatch.p2.isBye) {
              silverCont = finalMatch.p2.kontingen;
            } else if (finalMatch.p2 && finalMatch.p2.nama === finalMatch.winner.nama && finalMatch.p1 && !finalMatch.p1.isBye) {
              silverCont = finalMatch.p1.kontingen;
            }

            if (silverCont && standingMap[silverCont]) {
              if (isNonMedaliClass) {
                standingMap[silverCont].silverNonMedali += 1;
              } else {
                standingMap[silverCont].silver += 1;
              }
            }
          }

          if (isNonMedaliClass) return; // don't count bronzes for non-medali


          // Semifinal matches determine Bronzes
          if (roundsCount > 1) {
            const semiMatches = matches[roundsCount - 1] || [];
            
            // Semifinal 1 loser
            const semi1 = semiMatches[0];
            if (semi1 && semi1.winner) {
              let bronze1Cont: string | null = null;
              if (semi1.p1 && semi1.p1.nama === semi1.winner.nama && semi1.p2 && !semi1.p2.isBye && !semi1.p2.isPlaceholder) {
                bronze1Cont = semi1.p2.kontingen;
              } else if (semi1.p2 && semi1.p2.nama === semi1.winner.nama && semi1.p1 && !semi1.p1.isBye && !semi1.p1.isPlaceholder) {
                bronze1Cont = semi1.p1.kontingen;
              }

              if (bronze1Cont && standingMap[bronze1Cont]) {
                standingMap[bronze1Cont].bronze += 1;
              }
            }

            // Semifinal 2 loser
            const semi2 = semiMatches[1];
            if (semi2 && semi2.winner) {
              let bronze2Cont: string | null = null;
              if (semi2.p1 && semi2.p1.nama === semi2.winner.nama && semi2.p2 && !semi2.p2.isBye && !semi2.p2.isPlaceholder) {
                bronze2Cont = semi2.p2.kontingen;
              } else if (semi2.p2 && semi2.p2.nama === semi2.winner.nama && semi2.p1 && !semi2.p1.isBye && !semi2.p1.isPlaceholder) {
                bronze2Cont = semi2.p1.kontingen;
              }

              if (bronze2Cont && standingMap[bronze2Cont]) {
                standingMap[bronze2Cont].bronze += 1;
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse bracket data for", className, e);
      }
    });

    // Map standing map to arrays
    return Object.keys(standingMap).map(name => {
      const g = standingMap[name].gold;
      const gNM = standingMap[name].goldNonMedali;
      const s = standingMap[name].silver;
      const sNM = standingMap[name].silverNonMedali;
      const b = standingMap[name].bronze;
      return {
        contingentName: name,
        gold: g,
        silver: s,
        bronze: b,
        goldNonMedali: gNM,
        silverNonMedali: sNM,
        total: g + s + b + gNM + sNM
      };
    }).sort((a, b) => {
      // Sort rule 1: Gold DESC
      if (b.gold !== a.gold) return b.gold - a.gold;
      // Sort rule 2: Silver DESC
      if (b.silver !== a.silver) return b.silver - a.silver;
      // Sort rule 3: Bronze DESC
      if (b.bronze !== a.bronze) return b.bronze - a.bronze;
      // Sort rule 4: Total Participants DESC
      const countA = contingentAthleteCounts[a.contingentName] || 0;
      const countB = contingentAthleteCounts[b.contingentName] || 0;
      if (countB !== countA) return countB - countA;
      // Alphabetical ASC
      return a.contingentName.localeCompare(b.contingentName);
    });
  }, [activeContingents, activeClasses, includeNonMedali, contingentAthleteCounts]);

  // Compute overall totals for stats
  const totals = useMemo(() => {
    let goldSum = 0;
    let silverSum = 0;
    let bronzeSum = 0;
    let goldNMSum = 0;
    let silverNMSum = 0;
    medalStandings.forEach(s => {
      goldSum += s.gold;
      silverSum += s.silver;
      bronzeSum += s.bronze;
      goldNMSum += s.goldNonMedali;
      silverNMSum += s.silverNonMedali;
    });
    return { gold: goldSum, silver: silverSum, bronze: bronzeSum, goldNonMedali: goldNMSum, silverNonMedali: silverNMSum, total: goldSum + silverSum + bronzeSum + goldNMSum + silverNMSum };
  }, [medalStandings]);

  // Compute total athletes
  const totalAthletes = useMemo(() => {
    let count = 0;
    medalStandings.forEach(s => {
      count += contingentAthleteCounts[s.contingentName] || 0;
    });
    return count;
  }, [medalStandings, contingentAthleteCounts]);

  const hasMedals = totals.total > 0;

  // EXCEL EXPORT SCRIPT
  const handleExportExcel = () => {
    const rowsHtml = medalStandings.map((s, idx) => `
      <tr>
        <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px; font-weight: bold;">${idx + 1}</td>
        <td style="border: 1px solid #cbd5e1; text-align: left; padding: 8px; font-weight: bold; text-transform: uppercase;">${s.contingentName}</td>
        <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px;">${contingentAthleteCounts[s.contingentName] || 0}</td>
        <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px; background-color: #fcd34d; font-weight: bold;">${s.gold}</td>
        ${includeNonMedali ? `<td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px; background-color: #fef3c7; color: #b45309;">${s.goldNonMedali}</td>` : ''}
        <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px; background-color: #cbd5e1; font-weight: bold;">${s.silver}</td>
        ${includeNonMedali ? `<td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px; background-color: #f1f5f9; color: #475569;">${s.silverNonMedali}</td>` : ''}
        <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px; background-color: #fefaf0;">${s.bronze}</td>
        <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px; background-color: #f8fafc; font-weight: bold;">${s.total}</td>
      </tr>
    `).join("");

    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Rekap Juara Umum</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
          th { border: 2px solid #94a3b8; background-color: #e2e8f0; padding: 10px; font-weight: bold; text-align: center; }
          td { padding: 8px; }
        </style>
      </head>
      <body>
        <h2 style="text-align: center; text-transform: uppercase; margin-bottom: 5px;">REKAPITULASI PEROLEHAN MEDALI JUARA UMUM</h2>
        <p style="text-align: center; font-size: 11px; margin-top: 0; color: #64748b;">Sekretariat Pertandingan</p>
        <table>
          <thead>
            <tr>
              <th>PERINGKAT</th>
              <th>KONTINGEN / UTUSAN</th>
              <th>JUMLAH PESERTA</th>
              <th style="background-color: #fcd34d;">EMAS</th>
              ${includeNonMedali ? '<th style="background-color: #fef3c7;">NON MEDALI</th>' : ''}
              <th style="background-color: #cbd5e1;">PERAK</th>
              ${includeNonMedali ? '<th style="background-color: #f1f5f9;">NON MEDALI</th>' : ''}
              <th style="background-color: #fdba74;">PERUNGGU</th>
              <th>TOTAL MEDALI</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr style="background-color: #f1f5f9; font-weight: bold;">
              <td colspan="2" style="border: 1px solid #cbd5e1; text-align: right; padding: 10px;">TOTAL KESELURUHAN</td>
              <td style="border: 1px solid #cbd5e1; text-align: center;">${totalAthletes}</td>
              <td style="border: 1px solid #cbd5e1; text-align: center; background-color: #fcd34d;">${totals.gold}</td>
              ${includeNonMedali ? `<td style="border: 1px solid #cbd5e1; text-align: center; background-color: #fef3c7; color: #b45309;">${totals.goldNonMedali}</td>` : ''}
              <td style="border: 1px solid #cbd5e1; text-align: center; background-color: #cbd5e1;">${totals.silver}</td>
              ${includeNonMedali ? `<td style="border: 1px solid #cbd5e1; text-align: center; background-color: #f1f5f9; color: #475569;">${totals.silverNonMedali}</td>` : ''}
              <td style="border: 1px solid #cbd5e1; text-align: center; background-color: #fefaf0;">${totals.bronze}</td>
              <td style="border: 1px solid #cbd5e1; text-align: center; background-color: #f8fafc;">${totals.total}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([template], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekap_juara_umum_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Embedded print stylesheets */}
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
          header, aside, footer, nav, .no-print, .print-hidden, .print\:hidden, button, select, .sidebar, .navbar, .alert {
            display: none !important;
          }
          body, html, #root, #root > div, main {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .printable-recap-sheet {
            display: block !important;
            width: 100% !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}} />

      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 no-print">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo Event" className="h-24 object-contain" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-200">
            <Trophy size={32} />
          </div>
        )}
        
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">REKAPITULASI PEROLEHAN MEDALI KONTINGEN</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sekretariat Pertandingan</p>
        </div>

        <button
          onClick={() => setShowPrintPreview(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-slate-950/10"
        >
          <Printer size={15} />
          PRATINJAU CETAK & EKSPOR
        </button>
      </div>

      {/* MINIMUM PARTICIPANTS CONFIG / RULES TOGGLE CARD */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm no-print">
        <div className="space-y-0.5">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Aturan Klasifikasi Medali</span>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Aturan Minimal 3 Peserta per Bagan</h4>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            Jika bagan hanya diikuti oleh 1 atau 2 atlet, maka medali pada bagan tersebut dianggap sebagai <strong>Non-Medali</strong> (tidak dihitung dalam perolehan juara umum).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIncludeNonMedali(false)}
            className={`px-4 py-2.5 text-[10px] font-black rounded-xl border transition-all uppercase tracking-wider cursor-pointer ${
              !includeNonMedali 
                ? "bg-rose-600 text-white border-rose-600 shadow-sm" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            ❌ Non-Medali (Abaikan &lt; 3 Atlet)
          </button>
          <button
            onClick={() => setIncludeNonMedali(true)}
            className={`px-4 py-2.5 text-[10px] font-black rounded-xl border transition-all uppercase tracking-wider cursor-pointer ${
              includeNonMedali 
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            ✔ Tetap Hitung Medali
          </button>
        </div>
      </div>

      {/* PODIUM TOP 3 DISPLAY (Only shown when there are medals) */}
      {hasMedals && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 no-print">
          {/* 2nd Place */}
          {medalStandings[1] && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between items-center text-center order-2 md:order-1 border-t-4 border-t-slate-450">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-2xl mx-auto shadow-sm">
                  🥈
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight truncate max-w-[200px]">{medalStandings[1].contingentName}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Peringkat 2 Juara Umum</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3 text-xs font-black bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 w-full justify-center">
                <span className="text-amber-600">🥇 {medalStandings[1].gold}</span>
                <span className="text-slate-500">🥈 {medalStandings[1].silver}</span>
                <span className="text-amber-800">🥉 {medalStandings[1].bronze}</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {medalStandings[0] && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-7 flex flex-col justify-between items-center text-center order-1 md:order-2 border-t-8 border-t-amber-500 relative transform md:-translate-y-2">
              <span className="absolute -top-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[9px] font-black tracking-widest uppercase px-3 py-0.5 rounded-full shadow-md">
                CHAMPION
              </span>
              <div className="space-y-2.5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-400 to-yellow-500 flex items-center justify-center text-3xl mx-auto shadow-md">
                  👑
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-base uppercase tracking-tight truncate max-w-[220px]">{medalStandings[0].contingentName}</h4>
                  <span className="text-[10px] text-amber-600 font-extrabold uppercase">Peringkat 1 Juara Umum</span>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm font-black bg-amber-50/50 px-5 py-2.5 rounded-2xl border border-amber-200/50 w-full justify-center">
                <span className="text-amber-600">🥇 {medalStandings[0].gold}</span>
                <span className="text-slate-500">🥈 {medalStandings[0].silver}</span>
                <span className="text-amber-800">🥉 {medalStandings[0].bronze}</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {medalStandings[2] && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between items-center text-center order-3 border-t-4 border-t-amber-700">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-2xl mx-auto shadow-sm">
                  🥉
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight truncate max-w-[200px]">{medalStandings[2].contingentName}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Peringkat 3 Juara Umum</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3 text-xs font-black bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 w-full justify-center">
                <span className="text-amber-600">🥇 {medalStandings[2].gold}</span>
                <span className="text-slate-500">🥈 {medalStandings[2].silver}</span>
                <span className="text-amber-800">🥉 {medalStandings[2].bronze}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABLE MEDAL KLASEMEN (Initial table view requested) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden no-print">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-500" />
            Peringkat Perolehan Medali Kontingen
          </h3>
          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
            {medalStandings.length} Kontingen Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <th className="py-4 px-4 text-center w-16">Rank</th>
                <th className="py-4 px-6">Kontingen / Utusan</th>
                <th className="py-4 px-4 text-center w-36">Jumlah Peserta</th>
                <th className="py-4 px-4 text-center w-24">🥇 Emas</th>
                <th className="py-4 px-4 text-center w-24">🥇 Non</th>
                <th className="py-4 px-4 text-center w-24">🥈 Perak</th>
                <th className="py-4 px-4 text-center w-24">🥈 Non</th>
                <th className="py-4 px-4 text-center w-24">🥉 Perunggu</th>
                <th className="py-4 px-4 text-center w-28 bg-slate-50/30">Total Medali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {medalStandings.length === 0 ? (
                <tr>
                  <td colSpan={includeNonMedali ? 9 : 7} className="py-12 text-center text-slate-400 font-bold">
                    Belum ada kontingen yang aktif terdaftar.
                  </td>
                </tr>
              ) : (
                medalStandings.map((s, idx) => (
                  <tr key={s.contingentName} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 text-center font-black text-slate-900 bg-slate-50/20">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-800 uppercase tracking-tight">
                      {s.contingentName}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-600">
                      {contingentAthleteCounts[s.contingentName] || 0} Atlet
                    </td>
                    <td className="py-4 px-4 text-center font-black text-amber-600 bg-amber-50/10">
                      {s.gold}
                    </td>
                    <td className="py-4 px-4 text-center font-black text-slate-600 bg-slate-50/10">
                      {s.silver}
                    </td>
                    <td className="py-4 px-4 text-center font-black text-amber-900 bg-amber-50/5">
                      {s.bronze}
                    </td>
                    <td className="py-4 px-4 text-center font-black text-slate-900 bg-slate-50/30">
                      <span className="bg-slate-150 text-slate-800 px-3 py-1 rounded-xl text-[10px] font-black border border-slate-200">
                        {s.total}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {/* Totals Row */}
              <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                <td className="py-4 px-4 text-center"></td>
                <td className="py-4 px-6 text-left uppercase text-[10px] tracking-wider">TOTAL SELURUH KONTINGEN</td>
                <td className="py-4 px-4 text-center text-slate-950 bg-slate-100">{totalAthletes} Atlet</td>
                <td className="py-4 px-4 text-center text-amber-700 bg-amber-50">{totals.gold}</td>
                <td className="py-4 px-4 text-center text-slate-700 bg-slate-100">{totals.silver}</td>
                <td className="py-4 px-4 text-center text-amber-950 bg-amber-50/20">{totals.bronze}</td>
                <td className="py-4 px-4 text-center text-slate-950 bg-slate-100/50">{totals.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PRINT PREVIEW MODAL (Dual format: PDF & Excel requested) */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print animate-fade-in">
          <div className="bg-slate-50 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Control Panel */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-4 mb-4 gap-4">
              <div className="flex items-center gap-2">
                <Printer className="text-blue-600" size={20} />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                    Pratinjau Cetak Klasemen Medali
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Format cetak portrait A4 standar sekretariat pertandingan
                  </p>
                </div>
              </div>

              {/* Direct Export Action Triggers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} /> CETAK PDF / KERTAS (A4)
                </button>

                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} /> EKSPOR EXCEL (.XLS)
                </button>

                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Simulated Portrait Paper sheet */}
            <div className="flex-1 overflow-auto bg-slate-300 p-6 rounded-2xl border border-slate-400/30 flex justify-center items-start">
              <div 
                className="printable-recap-sheet bg-white shadow-2xl p-8 max-w-full"
                style={{ 
                  width: "210mm",
                  minHeight: "297mm",
                  boxSizing: "border-box"
                }}
              >
                {/* Printable Header with Logo on top, NO eventTitle, NO management system title */}
                <div className="text-center border-b-2 border-slate-950 pb-5 mb-6 flex flex-col items-center justify-center">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo Pertandingan" 
                      className="h-20 object-contain mb-3" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="border-2 border-amber-500 rounded-full p-3 bg-amber-50 mb-3 text-amber-600 flex items-center justify-center">
                      <Trophy size={36} />
                    </div>
                  )}
                  <h1 className="text-xl font-black text-black uppercase tracking-tight">
                    REKAPITULASI PEROLEHAN MEDALI JUARA UMUM
                  </h1>
                  <p className="text-[10px] text-slate-950 font-black tracking-widest uppercase mt-1">
                    Sekretariat Pertandingan
                  </p>
                </div>

                {/* Printable Table */}
                <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-400">
                      <th className="py-2.5 px-1 text-center font-black text-slate-850 border border-slate-300 w-12">PERINGKAT</th>
                      <th className="py-2.5 px-3 text-left font-black text-slate-850 border border-slate-300">KONTINGEN / UTUSAN</th>
                      <th className="py-2.5 px-3 text-center font-black text-slate-850 border border-slate-300 w-24">JUMLAH ATLET</th>
                      <th className="py-2.5 px-2 text-center font-black text-amber-800 border border-slate-300 bg-amber-50/50 w-24">🥇 EMAS</th>
                      <th className="py-2.5 px-2 text-center font-black text-slate-700 border border-slate-300 bg-slate-50/50 w-24">🥈 PERAK</th>
                      <th className="py-2.5 px-2 text-center font-black text-amber-900 border border-slate-300 bg-amber-50/20 w-24">🥉 PERUNGGU</th>
                      <th className="py-2.5 px-2 text-center font-black text-slate-900 border border-slate-300 bg-slate-100 w-24">TOTAL MEDALI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medalStandings.length === 0 ? (
                      <tr>
                        <td colSpan={includeNonMedali ? 9 : 7} className="py-8 text-center text-slate-400 font-bold">
                          Belum ada data klasemen untuk dicetak.
                        </td>
                      </tr>
                    ) : (
                      medalStandings.map((s, index) => (
                        <tr key={s.contingentName} className="border-b border-slate-200">
                          <td className="py-2 px-1 text-center font-black text-slate-900 border border-slate-300 bg-slate-50">
                            {index + 1}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 font-extrabold text-slate-950 uppercase">
                            {s.contingentName}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-600">
                            {contingentAthleteCounts[s.contingentName] || 0}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-black text-amber-800 bg-amber-50/10">
                            {s.gold}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-black text-slate-700 bg-slate-50/10">
                            {s.silver}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-black text-amber-900 bg-amber-50/5">
                            {s.bronze}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center font-black text-slate-900 bg-slate-50">
                            {s.total}
                          </td>
                        </tr>
                      ))
                    )}
                    {/* Total Footer Row */}
                    <tr className="bg-slate-100 font-black">
                      <td className="py-2.5 px-1 border border-slate-300 text-center"></td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right uppercase">TOTAL KESELURUHAN</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-center text-slate-950 bg-slate-200">{totalAthletes}</td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center text-amber-850 bg-amber-100/50">{totals.gold}</td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center text-slate-800 bg-slate-200/50">{totals.silver}</td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center text-amber-950 bg-amber-100/20">{totals.bronze}</td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center text-slate-950 bg-slate-200">{totals.total}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Printable Signatures */}
                <div className="mt-16 grid grid-cols-2 text-[10px] font-bold text-center">
                  <div>
                    <p>Ketua Pelaksana</p>
                    <div className="h-16"></div>
                    <p className="border-t border-slate-900 w-36 mx-auto pt-1"></p>
                  </div>
                  <div>
                    <p>Sekretaris Pertandingan</p>
                    <div className="h-16"></div>
                    <p className="border-t border-slate-900 w-36 mx-auto pt-1"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
