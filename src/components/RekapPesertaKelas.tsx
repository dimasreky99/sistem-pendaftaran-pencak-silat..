import React, { useState, useMemo } from "react";
import { ListTodo, Printer, Search, Download } from "lucide-react";
import { Athlete, MatchNode } from "../types";

interface RekapPesertaKelasProps {
  athletes: Athlete[];
}

export default function RekapPesertaKelas({ athletes }: RekapPesertaKelasProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"name" | "desc" | "asc">("name");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printScale, setPrintScale] = useState(100);

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

  // Helper to get total matches for a class by parsing its bracket
    const getBracketMatchesBreakdown = (className: string) => {
    const bracketKey = "silat_bracket_" + className;
    const saved = localStorage.getItem(bracketKey);
    let breakdown = { final: 0, semi: 0, perempat: 0, p8: 0, p16: 0, p32: 0, p64: 0, total: 0 };
    if (!saved) return breakdown;
    
    try {
      const bracketData = JSON.parse(saved);
      if (!bracketData || !bracketData.matches) return breakdown;
      
      const roundsCount = bracketData.roundsCount;
      for (let r = 1; r <= roundsCount; r++) {
        const roundMatches = bracketData.matches[r] || [];
        let validMatches = 0;
        roundMatches.forEach((match: MatchNode) => {
          const isBye = match.p1?.isBye || match.p2?.isBye;
          if (!isBye) {
            validMatches++;
          }
        });
        
        breakdown.total += validMatches;
        
        // r = roundsCount -> Final
        // r = roundsCount - 1 -> Semi
        if (r === roundsCount) breakdown.final += validMatches;
        else if (r === roundsCount - 1) breakdown.semi += validMatches;
        else if (r === roundsCount - 2) breakdown.perempat += validMatches;
        else if (r === roundsCount - 3) breakdown.p8 += validMatches;
        else if (r === roundsCount - 4) breakdown.p16 += validMatches;
        else if (r === roundsCount - 5) breakdown.p32 += validMatches;
        else breakdown.p64 += validMatches;
      }
    } catch (e) {
    }
    return breakdown;
  };

  const getBracketMatchesCount = (className: string) => {
    const bracketKey = "silat_bracket_" + className;
    const saved = localStorage.getItem(bracketKey);
    if (!saved) return 0;
    
    let count = 0;
    try {
      const bracketData = JSON.parse(saved);
      if (!bracketData || !bracketData.matches) return 0;
      
      const roundsCount = bracketData.roundsCount;
      for (let r = 1; r <= roundsCount; r++) {
        const roundMatches = bracketData.matches[r] || [];
        roundMatches.forEach((match: MatchNode) => {
          const isBye = match.p1?.isBye || match.p2?.isBye;
          if (!isBye) {
            count++;
          }
        });
      }
    } catch (e) {
      return 0;
    }
    return count;
  };

  const rekapData = useMemo(() => {
    // 1. Group by class
    const classGroups: Record<string, number> = {};
    athletes.forEach(a => {
      if (a.isAcc) {
        const cleanClass = a.kelas.replace(/ \[(?:Aktual|Validasi|Revisi):.*?\]/g, "");
        const cName = `${a.kategori} - ${a.jk} - ${cleanClass}`;
        classGroups[cName] = (classGroups[cName] || 0) + 1;
      }
    });

    // 2. Build rows and count matches
    const rows = Object.entries(classGroups).map(([className, participantCount]) => {
      const matchesCount = getBracketMatchesCount(className);
      const isSeni = /tunggal|ganda|beregu|jurus/i.test(className);
      return {
        className,
        participantCount,
        matchesCount,
        isSeni
      };
    });

    // 3. Sort by class name
    rows.sort((a, b) => a.className.localeCompare(b.className));
    return rows;
  }, [athletes]);




  const filteredData = useMemo(() => {
    let result = rekapData;
    if (searchQuery) {
      result = result.filter(d => d.className.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (sortOrder === "desc") {
      result = [...result].sort((a, b) => b.participantCount - a.participantCount);
    } else if (sortOrder === "asc") {
      result = [...result].sort((a, b) => a.participantCount - b.participantCount);
    }
    return result;
  }, [rekapData, searchQuery, sortOrder]);

  const totalAthletes = useMemo(() => {
    return filteredData.reduce((acc, row) => acc + row.participantCount, 0);
  }, [filteredData]);

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  const handleExportExcel = () => {
    let htmlContent = `
      <table border="1" style="border-collapse: collapse; font-family: sans-serif;">
        <thead>
          <tr style="background-color: #0f172a; color: white;">
            <th colspan="5" style="padding: 12px; font-size: 16px; font-weight: bold; text-align: center;">
              REKAPITULASI PESERTA & PARTAI - ${eventTitle.toUpperCase()}
            </th>
          </tr>
          <tr style="background-color: #334155; color: white; font-weight: bold; font-size: 11px;">
            <th style="padding: 8px; text-align: center; width: 50px;">NO</th>
            <th style="padding: 8px; text-align: left; width: 300px;">KELAS PERTANDINGAN</th>
            <th style="padding: 8px; text-align: center; width: 120px;">KATEGORI</th>
            <th style="padding: 8px; text-align: center; width: 120px;">JUMLAH PESERTA</th>
            <th style="padding: 8px; text-align: center; width: 120px;">JUMLAH PARTAI</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalPeserta = 0;
    let totalPartai = 0;

    rekapData.forEach((d, idx) => {
      totalPeserta += d.participantCount;
      if (!d.isSeni) totalPartai += d.matchesCount;

      htmlContent += `
        <tr>
          <td style="padding: 6px; text-align: center;">${idx + 1}</td>
          <td style="padding: 6px; font-weight: bold;">${d.className}</td>
          <td style="padding: 6px; text-align: center;">${d.isSeni ? "Seni Jurus" : "Tanding"}</td>
          <td style="padding: 6px; text-align: center; font-weight: bold;">${d.participantCount}</td>
          <td style="padding: 6px; text-align: center;">${d.isSeni ? "-" : d.matchesCount}</td>
        </tr>
      `;
    });

    htmlContent += `
        <tr style="background-color: #f8fafc; font-weight: bold;">
          <td colspan="3" style="padding: 8px; text-align: right;">TOTAL KESELURUHAN:</td>
          <td style="padding: 8px; text-align: center;">${totalPeserta}</td>
          <td style="padding: 8px; text-align: center;">${totalPartai}</td>
        </tr>
        </tbody>
      </table>
    `;

    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const blob = new Blob([template], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekapitulasi_Peserta_Kelas_${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ListTodo className="text-emerald-600" size={28} />
            Rekapitulasi Kelas & Partai
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            Total peserta aktif dan jumlah partai pertandingan per kelas.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold transition-all shadow-sm"
          >
            <Download size={18} />
            Export Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold transition-all shadow-sm shadow-slate-900/20"
          >
            <Printer size={18} />
            Cetak PDF / Print
          </button>
        </div>
      </div>

      {/* Filters (Hidden during print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 no-print">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari kelas pertandingan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "name" | "desc" | "asc")}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="name">Urutan: Nama Kelas (A-Z)</option>
            <option value="desc">Urutan: Peserta Terbanyak</option>
            <option value="asc">Urutan: Peserta Tersedikit</option>
          </select>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 print:p-0 print:border-none print:shadow-none print:bg-transparent min-h-[600px]">
        {/* KOP BANNER */}
        {logoUrl && (
          <div className="w-full flex justify-center mb-6 hidden print:flex no-print">
            <img src={logoUrl} alt="KOP BANNER" className="w-full max-h-[160px] object-contain" />
          </div>
        )}

        {/* Print Header */}
        <div className="text-center mb-8 hidden print:block space-y-1">
          <h1 className="text-xl font-black uppercase text-slate-900 leading-tight">
            REKAPITULASI PESERTA & PARTAI
          </h1>
          <h2 className="text-sm font-extrabold text-slate-600 uppercase tracking-widest">
            {eventTitle}
          </h2>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white print:bg-slate-200 print:text-slate-900 text-xs text-center">
                <th className="py-2 px-2 font-bold rounded-tl-xl print:border print:border-slate-800 print:rounded-none">No</th>
                <th className="py-2 px-3 font-bold text-left print:border print:border-slate-800">Kelas Pertandingan</th>
                <th className="py-2 px-2 font-bold print:border print:border-slate-800">Atlet</th>
                <th className="py-2 px-2 font-bold print:border print:border-slate-800" title="1/64 Final">1/64</th>
                <th className="py-2 px-2 font-bold print:border print:border-slate-800" title="1/32 Final">1/32</th>
                <th className="py-2 px-2 font-bold print:border print:border-slate-800" title="1/16 Final">1/16</th>
                <th className="py-2 px-2 font-bold print:border print:border-slate-800" title="1/8 Final">1/8</th>
                <th className="py-2 px-2 font-bold print:border print:border-slate-800" title="Perempat Final">1/4</th>
                <th className="py-2 px-2 font-bold print:border print:border-slate-800" title="Semi Final">Semi</th>
                <th className="py-2 px-2 font-bold print:border print:border-slate-800" title="Final">Final</th>
                <th className="py-2 px-2 font-bold rounded-tr-xl print:border print:border-slate-800 print:rounded-none">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-800 text-xs">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400 font-semibold print:border print:border-slate-800">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => {
                const breakdown = getBracketMatchesBreakdown(row.className);
                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-2 text-center text-slate-500 font-bold print:border print:border-slate-800">{index + 1}</td>
                    <td className="py-2 px-3 font-extrabold text-emerald-800 print:text-slate-900 print:border print:border-slate-800">
                      {row.className}
                      
                    </td>
                    <td className="py-2 px-2 text-center print:border print:border-slate-800">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-bold">{row.participantCount}</span>
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 font-semibold print:border print:border-slate-800">{breakdown.p64 > 0 ? breakdown.p64 : "-"}</td>
                    <td className="py-2 px-2 text-center text-slate-600 font-semibold print:border print:border-slate-800">{breakdown.p32 > 0 ? breakdown.p32 : "-"}</td>
                    <td className="py-2 px-2 text-center text-slate-600 font-semibold print:border print:border-slate-800">{breakdown.p16 > 0 ? breakdown.p16 : "-"}</td>
                    <td className="py-2 px-2 text-center text-slate-600 font-semibold print:border print:border-slate-800">{breakdown.p8 > 0 ? breakdown.p8 : "-"}</td>
                    <td className="py-2 px-2 text-center text-slate-600 font-semibold print:border print:border-slate-800">{breakdown.perempat > 0 ? breakdown.perempat : "-"}</td>
                    <td className="py-2 px-2 text-center text-slate-600 font-semibold print:border print:border-slate-800">{breakdown.semi > 0 ? breakdown.semi : "-"}</td>
                    <td className="py-2 px-2 text-center text-slate-600 font-semibold print:border print:border-slate-800">{breakdown.final > 0 ? breakdown.final : "-"}</td>
                    <td className="py-2 px-2 text-center print:border print:border-slate-800">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
                        {breakdown.total}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
            {/* Grand Total Row */}
            {filteredData.length > 0 && (
              <tr className="bg-slate-100 font-black text-slate-900 print:bg-slate-200">
                <td colSpan={2} className="py-3 px-4 text-right print:border print:border-slate-800 uppercase tracking-widest text-[10px]">Grand Total</td>
                <td className="py-3 px-2 text-center print:border print:border-slate-800 text-sm">{totalAthletes}</td>
                <td className="py-3 px-2 text-center print:border print:border-slate-800 text-sm">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).p64, 0)}</td>
                <td className="py-3 px-2 text-center print:border print:border-slate-800 text-sm">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).p32, 0)}</td>
                <td className="py-3 px-2 text-center print:border print:border-slate-800 text-sm">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).p16, 0)}</td>
                <td className="py-3 px-2 text-center print:border print:border-slate-800 text-sm">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).p8, 0)}</td>
                <td className="py-3 px-2 text-center print:border print:border-slate-800 text-sm">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).perempat, 0)}</td>
                <td className="py-3 px-2 text-center print:border print:border-slate-800 text-sm">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).semi, 0)}</td>
                <td className="py-3 px-2 text-center print:border print:border-slate-800 text-sm">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).final, 0)}</td>
                <td className="py-3 px-2 text-center text-emerald-700 print:border print:border-slate-800 text-sm">
                  {filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).total, 0)}
                </td>
              </tr>
            )}
          </tbody>
            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 print:bg-slate-100">
                  <td colSpan={3} className="py-4 px-4 text-right font-black text-slate-900 print:border print:border-slate-800 uppercase text-sm">
                    Total Keseluruhan:
                  </td>
                  <td className="py-4 px-4 text-center font-black text-slate-900 text-lg print:border print:border-slate-800">
                    {filteredData.reduce((acc, curr) => acc + curr.participantCount, 0)}
                  </td>
                  <td className="py-4 px-4 text-center font-black text-emerald-600 text-lg print:border print:border-slate-800 print:text-slate-900">
                    {filteredData.reduce((acc, curr) => curr.isSeni ? acc : acc + curr.matchesCount, 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      {/* PRINT PREVIEW MODAL */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print animate-fade-in">
          <div className="bg-slate-50 rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-4 mb-4 gap-4">
              <div className="flex items-center gap-2">
                <Printer className="text-blue-600" size={22} />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase">Pratinjau Cetak Rekap</h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Mencetak Rekapitulasi Peserta Kelas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-200/60 px-3 py-1.5 rounded-xl border border-slate-300/50">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Skala:</span>
                <input type="range" min="30" max="120" step="5" value={printScale} onChange={(e) => setPrintScale(parseInt(e.target.value))} className="w-24 sm:w-32 cursor-pointer accent-blue-600 h-1" />
                <span className="text-xs font-black text-blue-950 w-8 text-right">{printScale}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const styleElement = document.createElement("style");
                  styleElement.innerHTML = `
                    @media print {
                      @page { size: A4 portrait; margin: 10mm; }
                      body * { visibility: hidden; }
                      #print-rekap-area, #print-rekap-area * { visibility: visible; }
                      #print-rekap-area { position: absolute; left: 0; top: 0; width: 100%; transform: scale(${printScale/100}); transform-origin: top left; }
                    }
                  `;
                  document.head.appendChild(styleElement);
                  window.print();
                  document.head.removeChild(styleElement);
                }} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-900/20 text-xs">
                  <Printer size={16} /> CETAK PDF
                </button>
                <button onClick={() => setShowPrintPreview(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-5 py-2.5 rounded-xl transition-all text-xs">TUTUP</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-slate-200/50 rounded-2xl border border-slate-300 p-4 sm:p-8 custom-scrollbar relative">
              <div id="print-rekap-area" className="bg-white shadow-sm border border-slate-200 mx-auto origin-top" style={{ transform: `scale(${printScale / 100})`, width: "210mm", minHeight: "297mm", padding: "10mm" }}>
                
                <div className="text-center mb-6 pb-4 border-b-2 border-slate-800">
                  <h1 className="text-xl font-black uppercase text-slate-900 mb-1">{systemSettings.eventTitle || "NAMA TURNAMEN"}</h1>
                  <h2 className="text-sm font-bold text-slate-600 uppercase">REKAPITULASI JUMLAH PESERTA PER KELAS TANDING</h2>
                </div>

                <table className="w-full text-left text-xs text-slate-800 border-collapse border border-slate-800">
                  <thead className="bg-slate-100 font-black uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-2 text-center border border-slate-800" rowSpan={2} style={{ width: "40px" }}>No</th>
                      <th className="py-2 px-3 border border-slate-800" rowSpan={2}>Kategori / Kelas</th>
                      <th className="py-2 px-2 text-center border border-slate-800" colSpan={8}>Rincian Bagan & Partai</th>
                      <th className="py-2 px-2 text-center border border-slate-800" rowSpan={2} style={{ width: "80px" }}>Total Atlet</th>
                    </tr>
                    <tr>
                      <th className="py-1 px-1 text-center border border-slate-800" title="Babak Penyisihan (1/64 Final)">64</th>
                      <th className="py-1 px-1 text-center border border-slate-800" title="Babak Penyisihan (1/32 Final)">32</th>
                      <th className="py-1 px-1 text-center border border-slate-800" title="1/16 Final">16</th>
                      <th className="py-1 px-1 text-center border border-slate-800" title="1/8 Final">8</th>
                      <th className="py-1 px-1 text-center border border-slate-800" title="Perempat Final">1/4</th>
                      <th className="py-1 px-1 text-center border border-slate-800" title="Semi Final">1/2</th>
                      <th className="py-1 px-1 text-center border border-slate-800" title="Final">F</th>
                      <th className="py-1 px-1 text-center border border-slate-800 text-emerald-800">Σ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[10px] font-semibold">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-slate-400 font-semibold border border-slate-800">Data tidak ditemukan</td>
                      </tr>
                    ) : (
                      filteredData.map((row, index) => {
                        const breakdown = getBracketMatchesBreakdown(row.className);
                        return (
                          <tr key={index}>
                            <td className="py-1.5 px-2 text-center border border-slate-800">{index + 1}</td>
                            <td className="py-1.5 px-3 font-extrabold border border-slate-800">{row.className}</td>
                            <td className="py-1.5 px-1 text-center border border-slate-800 text-slate-500">{breakdown.p64 || "-"}</td>
                            <td className="py-1.5 px-1 text-center border border-slate-800 text-slate-500">{breakdown.p32 || "-"}</td>
                            <td className="py-1.5 px-1 text-center border border-slate-800 text-slate-500">{breakdown.p16 || "-"}</td>
                            <td className="py-1.5 px-1 text-center border border-slate-800 text-slate-500">{breakdown.p8 || "-"}</td>
                            <td className="py-1.5 px-1 text-center border border-slate-800 text-slate-500">{breakdown.perempat || "-"}</td>
                            <td className="py-1.5 px-1 text-center border border-slate-800 text-slate-500">{breakdown.semi || "-"}</td>
                            <td className="py-1.5 px-1 text-center border border-slate-800 text-slate-500">{breakdown.final || "-"}</td>
                            <td className="py-1.5 px-1 text-center font-bold text-emerald-700 border border-slate-800 bg-slate-50">{breakdown.total}</td>
                            <td className="py-1.5 px-2 text-center font-black text-slate-900 border border-slate-800 bg-slate-100 text-[11px]">{row.participantCount}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {filteredData.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-200 font-black text-slate-900 text-xs">
                        <td colSpan={2} className="py-2 px-3 text-right border border-slate-800 uppercase">GRAND TOTAL:</td>
                        <td className="py-2 px-1 text-center border border-slate-800">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).p64, 0)}</td>
                        <td className="py-2 px-1 text-center border border-slate-800">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).p32, 0)}</td>
                        <td className="py-2 px-1 text-center border border-slate-800">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).p16, 0)}</td>
                        <td className="py-2 px-1 text-center border border-slate-800">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).p8, 0)}</td>
                        <td className="py-2 px-1 text-center border border-slate-800">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).perempat, 0)}</td>
                        <td className="py-2 px-1 text-center border border-slate-800">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).semi, 0)}</td>
                        <td className="py-2 px-1 text-center border border-slate-800">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).final, 0)}</td>
                        <td className="py-2 px-1 text-center border border-slate-800 text-emerald-800">{filteredData.reduce((acc, row) => acc + getBracketMatchesBreakdown(row.className).total, 0)}</td>
                        <td className="py-2 px-2 text-center text-sm border border-slate-800">{totalAthletes}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}