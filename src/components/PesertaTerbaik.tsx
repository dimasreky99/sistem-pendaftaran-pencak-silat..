import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, Printer, User, Search, Award, Save, RefreshCw, ChevronDown } from "lucide-react";
import { Athlete, SystemSettings } from "../types";

interface PesertaTerbaikProps {
  athletes: Athlete[];
  settings: SystemSettings;
}

interface BestAthleteRow {
  category: string;
  putraName: string;
  putraContingent: string;
  putraClass: string;
  putriName: string;
  putriContingent: string;
  putriClass: string;
}

const DEFAULT_ROWS: BestAthleteRow[] = [
  {
    category: "USIA DINI",
    putraName: "",
    putraContingent: "",
    putraClass: "",
    putriName: "",
    putriContingent: "",
    putriClass: ""
  },
  {
    category: "PRA REMAJA",
    putraName: "",
    putraContingent: "",
    putraClass: "",
    putriName: "",
    putriContingent: "",
    putriClass: ""
  },
  {
    category: "REMAJA",
    putraName: "",
    putraContingent: "",
    putraClass: "",
    putriName: "",
    putriContingent: "",
    putriClass: ""
  },
  {
    category: "DEWASA",
    putraName: "",
    putraContingent: "",
    putraClass: "",
    putriName: "",
    putriContingent: "",
    putriClass: ""
  }
];

const getCategoriesForScheme = (scheme: string) => {
  switch (scheme) {
    case "Prestasi":
      return ["PRESTASI"];
    case "Pemasalan":
      return ["PEMASALAN"];
    case "Keduanya":
      return ["PRESTASI", "PEMASALAN"];
    case "Per Kategori Umur":
    default:
      return ["USIA DINI", "PRA REMAJA", "REMAJA", "DEWASA"];
  }
};

export default function PesertaTerbaik({ athletes, settings }: PesertaTerbaikProps) {
  const scheme = settings.bestFighterScheme || "Per Kategori Umur";
  const activeCategories = useMemo(() => getCategoriesForScheme(scheme), [scheme]);

  // Load saved data as a category-to-row map
  const [savedRows, setSavedRows] = useState<Record<string, Partial<BestAthleteRow>>>(() => {
    const saved = localStorage.getItem("silat_peserta_terbaik_rows_map");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    // Migrate old format if available
    const legacy = localStorage.getItem("silat_peserta_terbaik_rows");
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as BestAthleteRow[];
        const map: Record<string, Partial<BestAthleteRow>> = {};
        parsed.forEach(r => {
          map[r.category] = r;
        });
        return map;
      } catch (e) {}
    }
    return {};
  });

  // Save to localStorage when savedRows changes
  useEffect(() => {
    localStorage.setItem("silat_peserta_terbaik_rows_map", JSON.stringify(savedRows));
  }, [savedRows]);

  // Derive the active rows from the current scheme and our map
  const rows = useMemo(() => {
    return activeCategories.map(cat => ({
      category: cat,
      putraName: savedRows[cat]?.putraName || "",
      putraContingent: savedRows[cat]?.putraContingent || "",
      putraClass: savedRows[cat]?.putraClass || "",
      putriName: savedRows[cat]?.putriName || "",
      putriContingent: savedRows[cat]?.putriContingent || "",
      putriClass: savedRows[cat]?.putriClass || ""
    }));
  }, [activeCategories, savedRows]);

  const [header1, setHeader1] = useState(() => localStorage.getItem("silat_best_h1") || "PERTANDINGAN PENCAK SILAT");
  const [header2, setHeader2] = useState(() => localStorage.getItem("silat_best_h2") || "CABANG OLAHRAGA PENCAK SILAT");
  const [header3, setHeader3] = useState(() => localStorage.getItem("silat_best_h3") || "PORKAB - 2026");
  const [header4, setHeader4] = useState(() => localStorage.getItem("silat_best_h4") || "IPSI KABUPATEN SIDOARJO");

  const [placeDate, setPlaceDate] = useState(() => localStorage.getItem("silat_best_place") || "Sidoarjo, 21 Juni 2026");
  const [ketuaPanitia, setKetuaPanitia] = useState(() => localStorage.getItem("silat_best_ketua") || "H. Kuswandi, S.H., M.M.");
  const [sekretaris, setSekretaris] = useState(() => localStorage.getItem("silat_best_sekretaris") || "Raka Tegar Pamungkas");

  const [isPrinting, setIsPrinting] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    localStorage.setItem("silat_best_h1", header1);
    localStorage.setItem("silat_best_h2", header2);
    localStorage.setItem("silat_best_h3", header3);
    localStorage.setItem("silat_best_h4", header4);
  }, [header1, header2, header3, header4]);

  useEffect(() => {
    localStorage.setItem("silat_best_place", placeDate);
    localStorage.setItem("silat_best_ketua", ketuaPanitia);
    localStorage.setItem("silat_best_sekretaris", sekretaris);
  }, [placeDate, ketuaPanitia, sekretaris]);

  // Handle manual cell edits
  const handleCellChange = (rowIndex: number, field: keyof BestAthleteRow, value: string) => {
    const category = rows[rowIndex].category;
    const updated = {
      ...savedRows,
      [category]: {
        ...(savedRows[category] || {}),
        category,
        [field]: value
      }
    };
    setSavedRows(updated);
  };

  // List of validated ACC athletes for autocomplete / selection
  const validatedAthletes = useMemo(() => {
    return athletes.filter(a => a.isAcc);
  }, [athletes]);

  // Render a dropdown for quick autofill
  const [dropdownOpen, setDropdownOpen] = useState<{ rowIndex: number; gender: "putra" | "putri" } | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const filteredAthletesForDropdown = useMemo(() => {
    if (!dropdownOpen) return [];
    const jkFilter = dropdownOpen.gender === "putra" ? "Putra" : "Putri";
    return validatedAthletes.filter(a => {
      const matchJk = a.jk === jkFilter;
      const matchSearch = a.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          a.kontingen.toLowerCase().includes(searchFilter.toLowerCase());
      return matchJk && matchSearch;
    });
  }, [dropdownOpen, validatedAthletes, searchFilter]);

  const selectAthleteForCell = (rowIndex: number, gender: "putra" | "putri", athlete: Athlete) => {
    const category = rows[rowIndex].category;
    
    // Clean class name weight for athlete's class
    let rawClass = athlete.kelas;
    let classCleaned = rawClass;
    if (rawClass.includes(" | ")) {
      classCleaned = rawClass.split(" | ")[1];
    }
    classCleaned = classCleaned
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/:\s*\d+-\d+kg/i, "")
      .replace(/\d+\s*-\s*\d+\s*kg/i, "")
      .replace(/\d+kg/i, "")
      .replace(/[-\s,|]+$/g, "")
      .trim();

    const currentData = savedRows[category] || {};
    let updatedData = { ...currentData, category };

    if (gender === "putra") {
      updatedData.putraName = athlete.name;
      updatedData.putraContingent = athlete.kontingen;
      updatedData.putraClass = `Kelas ${classCleaned} Putra`;
    } else {
      updatedData.putriName = athlete.name;
      updatedData.putriContingent = athlete.kontingen;
      updatedData.putriClass = `Kelas ${classCleaned} Putri`;
    }

    const updated = {
      ...savedRows,
      [category]: updatedData
    };
    setSavedRows(updated);
    setDropdownOpen(null);
    setSearchFilter("");
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan seluruh data Peserta Terbaik?")) {
      setSavedRows({});
    }
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

        {/* PRINT HEADER / LOGO */}
        {settings.logoUrl ? (
          <div className="w-full flex justify-center mb-6 border-b-2 border-slate-950 pb-4">
            <img src={settings.logoUrl} alt="KOP BANNER" className="w-full max-h-[160px] object-contain" />
          </div>
        ) : (
          <div className="text-center border-b-2 border-slate-950 pb-4 mb-6">
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-widest">{header1}</h2>
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-widest">{header2}</h2>
            <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight mt-1">{header3}</h1>
            <p className="text-[10px] text-slate-950 font-black tracking-widest uppercase mt-0.5">
              {header4}
            </p>
          </div>
        )}

        {/* REKAP GREEN TITLE */}
        <div className="bg-emerald-600 text-white font-black text-center py-3.5 rounded-sm border border-emerald-700 shadow-sm mb-6 uppercase tracking-wider text-sm">
          PESILAT TERBAIK <br /> {header3}
        </div>

        {/* PRINT BUTTON ON TOP IN PREVIEW MODE */}
        <div className="mb-4 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase no-print">
          <div>Menampilkan {rows.length} Kategori Usia</div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer">Cetak Sekarang</button>
            <button onClick={() => setIsPrinting(false)} className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-bold cursor-pointer">Kembali</button>
          </div>
        </div>

        {/* TABLE LAYOUT EXACTLY MATCHING THE PDF SPEC */}
        <table className="w-full border-collapse border border-slate-950 text-xs text-slate-950">
          <thead>
            <tr className="bg-amber-400 font-black border border-slate-950 uppercase text-center text-[11px]">
              <th colSpan={2} className="py-2.5 px-2 border-r border-slate-950 w-2/5 text-slate-950">PUTRA</th>
              <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-950 w-1/5 text-slate-950 bg-amber-400">USIA / KATEGORI</th>
              <th colSpan={2} className="py-2.5 px-2 w-2/5 text-slate-950">PUTRI</th>
            </tr>
            <tr className="bg-amber-100 font-bold border-b border-slate-950 uppercase text-[9px]">
              <th className="py-1.5 px-2 border-r border-slate-950 w-[25%] text-left">NAMA</th>
              <th className="py-1.5 px-2 border-r border-slate-950 w-[15%] text-left">KONTINGEN</th>
              <th className="py-1.5 px-2 border-r border-slate-950 w-[25%] text-left">NAMA</th>
              <th className="py-1.5 px-2 w-[15%] text-left">KONTINGEN</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <React.Fragment key={row.category}>
                {/* Row 1: Name & Contingent */}
                <tr className="border-t border-slate-950">
                  <td className="py-2.5 px-2 font-black border-r border-slate-300 w-[25%] truncate uppercase">
                    {row.putraName || <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-2.5 px-2 font-bold border-r border-slate-950 w-[15%] truncate uppercase text-slate-700">
                    {row.putraContingent || <span className="text-slate-300 italic">—</span>}
                  </td>
                  {/* Middle Age Column - Spanned across both rows */}
                  <td rowSpan={2} className="py-4 px-2 border-r border-slate-950 font-black text-center bg-yellow-400 text-slate-950 align-middle tracking-wider">
                    {row.category}
                  </td>
                  <td className="py-2.5 px-2 font-black border-r border-slate-300 w-[25%] truncate uppercase">
                    {row.putriName || <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-2.5 px-2 font-bold w-[15%] truncate uppercase text-slate-700">
                    {row.putriContingent || <span className="text-slate-300 italic">—</span>}
                  </td>
                </tr>
                {/* Row 2: Class row */}
                <tr className="border-b border-slate-950 bg-slate-50/50">
                  <td colSpan={2} className="py-1.5 px-2 border-r border-slate-950 font-semibold text-[10px] text-slate-600 italic">
                    {row.putraClass ? row.putraClass : <span className="text-slate-300">—</span>}
                  </td>
                  <td colSpan={2} className="py-1.5 px-2 font-semibold text-[10px] text-slate-600 italic">
                    {row.putriClass ? row.putriClass : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* SIGNATURES SECTION */}
        <div className="mt-20 grid grid-cols-2 text-[11px] font-bold text-center">
          <div>
            <p>Ketua Panitia</p>
            <div className="h-20"></div>
            <p className="font-extrabold text-slate-950 underline">{ketuaPanitia}</p>
          </div>
          <div>
            <p>{placeDate}</p>
            <p>Sekretaris Pertandingan</p>
            <div className="h-20"></div>
            <p className="font-extrabold text-slate-950 underline">{sekretaris}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-3 py-1 text-[9px] font-black tracking-widest uppercase inline-block mb-1">
              👑 Sekretariat Pertandingan
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="text-amber-400" size={24} />
              MANAJEMEN PESERTA TERBAIK
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Tentukan dan kelola secara manual para Pesilat / Peserta Terbaik untuk masing-masing tingkatan usia. Anda dapat mencari dan memilih dari atlet yang terdaftar atau mengisinya secara bebas.
            </p>
          </div>

          <div className="flex gap-2.5 self-stretch md:self-auto">
            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-3 rounded-2xl transition-all cursor-pointer flex-1 md:flex-none text-center"
            >
              Reset Data
            </button>
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/30 flex-1 md:flex-none justify-center"
            >
              <Printer size={16} />
              CETAK PESILAT TERBAIK
            </button>
          </div>
        </div>
      </div>

      {/* VIEW / EDIT TABS */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl max-w-xs">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "edit" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Form Input
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "preview" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Pratinjau Cetak
        </button>
      </div>

      {activeTab === "edit" ? (
        <div className="space-y-6">
          {/* HEADER AND SIGNATURES CONFIG */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-slate-950 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
              ⚙️ Konfigurasi Kop Surat & Tanda Tangan Cetak
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kop Baris 1 (Instansi / Acara)</label>
                <input
                  type="text"
                  value={header1}
                  onChange={(e) => setHeader1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                  placeholder="Contoh: PERTANDINGAN PENCAK SILAT ANTAR PELAJAR"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kop Baris 2 (Dinas / Pelaksana)</label>
                <input
                  type="text"
                  value={header2}
                  onChange={(e) => setHeader2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                  placeholder="Contoh: DINAS PENDIDIKAN & KEBUDAYAAN"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kop Baris 3 (Nama Event Utama)</label>
                <input
                  type="text"
                  value={header3}
                  onChange={(e) => setHeader3(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                  placeholder="Contoh: PORKAB - 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kop Baris 4 (Penyelenggara IPSI)</label>
                <input
                  type="text"
                  value={header4}
                  onChange={(e) => setHeader4(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                  placeholder="Contoh: IPSI KABUPATEN SIDOARJO"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tempat & Tanggal (Kanan Atas TTD)</label>
                <input
                  type="text"
                  value={placeDate}
                  onChange={(e) => setPlaceDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                  placeholder="Contoh: Sidoarjo, 21 Juni 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Ketua Panitia</label>
                <input
                  type="text"
                  value={ketuaPanitia}
                  onChange={(e) => setKetuaPanitia(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                  placeholder="Contoh: H. Kuswandi, S.H., M.M."
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Sekretaris Pertandingan</label>
                <input
                  type="text"
                  value={sekretaris}
                  onChange={(e) => setSekretaris(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                  placeholder="Contoh: Raka Tegar Pamungkas"
                />
              </div>
            </div>
          </div>

          {/* ACTIVE CATEGORY ROWS INPUT FORM */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 space-y-6">
            <h3 className="font-extrabold text-slate-950 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
              📝 Daftar Atlet Terbaik Per Kategori Usia
            </h3>

            <div className="space-y-8">
              {rows.map((row, index) => (
                <div key={row.category} className="border border-slate-100 bg-slate-50/40 rounded-3xl p-5 space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="bg-yellow-400 text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider">
                      {row.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">MANUAL INPUT ATAU CARI</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* PUTRA CORNER */}
                    <div className="space-y-3.5 bg-blue-50/10 border border-blue-100/50 p-4 rounded-2xl relative">
                      <div className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-1 mb-2">
                        <span>♂️</span> KATEGORI PUTRA terbaik
                      </div>

                      <div className="relative">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nama Lengkap</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={row.putraName}
                            onChange={(e) => handleCellChange(index, "putraName", e.target.value)}
                            className="flex-1 bg-white border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                            placeholder="Ketik nama putra..."
                          />
                          <button
                            onClick={() => {
                              setDropdownOpen({ rowIndex: index, gender: "putra" });
                              setSearchFilter(row.putraName);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 rounded-xl flex items-center justify-center cursor-pointer"
                            title="Cari dari database atlet"
                          >
                            <Search size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Kontingen / Utusan</label>
                          <input
                            type="text"
                            value={row.putraContingent}
                            onChange={(e) => handleCellChange(index, "putraContingent", e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none uppercase"
                            placeholder="Misal: Pagar Nusa"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Kelas Tanding / Detail</label>
                          <input
                            type="text"
                            value={row.putraClass}
                            onChange={(e) => handleCellChange(index, "putraClass", e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                            placeholder="Misal: Kelas C Putra"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PUTRI CORNER */}
                    <div className="space-y-3.5 bg-rose-50/10 border border-rose-100/50 p-4 rounded-2xl relative">
                      <div className="text-[10px] font-black text-rose-700 uppercase tracking-widest flex items-center gap-1 mb-2">
                        <span>♀️</span> KATEGORI PUTRI terbaik
                      </div>

                      <div className="relative">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nama Lengkap</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={row.putriName}
                            onChange={(e) => handleCellChange(index, "putriName", e.target.value)}
                            className="flex-1 bg-white border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                            placeholder="Ketik nama putri..."
                          />
                          <button
                            onClick={() => {
                              setDropdownOpen({ rowIndex: index, gender: "putri" });
                              setSearchFilter(row.putriName);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 rounded-xl flex items-center justify-center cursor-pointer"
                            title="Cari dari database atlet"
                          >
                            <Search size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Kontingen / Utusan</label>
                          <input
                            type="text"
                            value={row.putriContingent}
                            onChange={(e) => handleCellChange(index, "putriContingent", e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none uppercase"
                            placeholder="Misal: Tapak Suci"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Kelas Tanding / Detail</label>
                          <input
                            type="text"
                            value={row.putriClass}
                            onChange={(e) => handleCellChange(index, "putriClass", e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-slate-950 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                            placeholder="Misal: Kelas B Putri"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FLOATING DROPDOWN FOR ATHLETE SEARCH AUTOCOMPLETE */}
                  {dropdownOpen && dropdownOpen.rowIndex === index && (
                    <div className="absolute inset-x-0 top-16 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-800 uppercase">
                          Pilih Atlet {dropdownOpen.gender === "putra" ? "Putra" : "Putri"} ({row.category})
                        </span>
                        <button
                          onClick={() => setDropdownOpen(null)}
                          className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Ketik untuk memfilter nama/kontingen..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-slate-950"
                        autoFocus
                      />

                      <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                        {filteredAthletesForDropdown.length === 0 ? (
                          <div className="text-center py-4 text-slate-400 text-xs italic">
                            Tidak ada atlet {dropdownOpen.gender} yang cocok atau terverifikasi ACC.
                          </div>
                        ) : (
                          filteredAthletesForDropdown.map((ath) => (
                            <button
                              key={ath.id}
                              onClick={() => selectAthleteForCell(index, dropdownOpen.gender, ath)}
                              className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg flex justify-between items-center transition-all cursor-pointer"
                            >
                              <div>
                                <div className="text-xs font-extrabold text-slate-900">{ath.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">{ath.kontingen}</div>
                              </div>
                              <div className="text-[9px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-bold">
                                {ath.kelas.replace(/.*?\s*\|\s*/, "")}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* PRINT PREVIEW COMPONENT ON SCREEN */
        <div className="bg-slate-100 border border-slate-200 rounded-3xl p-1 md:p-8 flex justify-center shadow-inner">
          <div className="bg-white text-slate-950 w-full max-w-[720px] p-8 md:p-12 shadow-2xl border border-slate-300 rounded-sm font-sans min-h-[900px] flex flex-col justify-between">
            <div>
              {/* PRINT HEADER */}
              <div className="text-center border-b-2 border-slate-950 pb-4 mb-6">
                <h2 className="text-xs font-black text-slate-950 uppercase tracking-widest">{header1}</h2>
                <h2 className="text-xs font-black text-slate-950 uppercase tracking-widest">{header2}</h2>
                <h1 className="text-sm font-black text-slate-950 uppercase tracking-tight mt-1">{header3}</h1>
                <p className="text-[9px] text-slate-950 font-black tracking-widest uppercase mt-0.5">
                  {header4}
                </p>
              </div>

              {/* REKAP GREEN TITLE */}
              <div className="bg-emerald-600 text-white font-black text-center py-3 rounded-sm border border-emerald-700 shadow-sm mb-6 uppercase tracking-wider text-xs">
                PESILAT TERBAIK <br /> {header3}
              </div>

              {/* TABLE LAYOUT */}
              <table className="w-full border-collapse border border-slate-950 text-[10px] text-slate-950">
                <thead>
                  <tr className="bg-amber-400 font-black border border-slate-950 uppercase text-center text-[10px]">
                    <th colSpan={2} className="py-2 px-2 border-r border-slate-950 w-2/5">PUTRA</th>
                    <th rowSpan={2} className="py-2 px-2 border-r border-slate-950 w-1/5 bg-amber-400">USIA / KATEGORI</th>
                    <th colSpan={2} className="py-2 px-2 w-2/5">PUTRI</th>
                  </tr>
                  <tr className="bg-amber-100 font-bold border-b border-slate-950 uppercase text-[8px]">
                    <th className="py-1 px-2 border-r border-slate-950 w-[25%] text-left">NAMA</th>
                    <th className="py-1 px-2 border-r border-slate-950 w-[15%] text-left">KONTINGEN</th>
                    <th className="py-1 px-2 border-r border-slate-950 w-[25%] text-left">NAMA</th>
                    <th className="py-1 px-2 w-[15%] text-left">KONTINGEN</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <React.Fragment key={row.category}>
                      {/* Row 1: Name & Contingent */}
                      <tr className="border-t border-slate-950">
                        <td className="py-2 px-2 font-black border-r border-slate-300 w-[25%] truncate uppercase">
                          {row.putraName || <span className="text-slate-300 italic">—</span>}
                        </td>
                        <td className="py-2 px-2 font-bold border-r border-slate-950 w-[15%] truncate uppercase text-slate-700">
                          {row.putraContingent || <span className="text-slate-300 italic">—</span>}
                        </td>
                        {/* Middle Age Column - Spanned across both rows */}
                        <td rowSpan={2} className="py-3 px-2 border-r border-slate-950 font-black text-center bg-yellow-400 text-slate-950 align-middle tracking-wider">
                          {row.category}
                        </td>
                        <td className="py-2 px-2 font-black border-r border-slate-300 w-[25%] truncate uppercase">
                          {row.putriName || <span className="text-slate-300 italic">—</span>}
                        </td>
                        <td className="py-2 px-2 font-bold w-[15%] truncate uppercase text-slate-700">
                          {row.putriContingent || <span className="text-slate-300 italic">—</span>}
                        </td>
                      </tr>
                      {/* Row 2: Class row */}
                      <tr className="border-b border-slate-950 bg-slate-50/50 text-[9px]">
                        <td colSpan={2} className="py-1 px-2 border-r border-slate-950 font-semibold text-slate-600 italic">
                          {row.putraClass ? row.putraClass : <span className="text-slate-300">—</span>}
                        </td>
                        <td colSpan={2} className="py-1 px-2 font-semibold text-slate-600 italic">
                          {row.putriClass ? row.putriClass : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SIGNATURES SECTION */}
            <div className="mt-16 grid grid-cols-2 text-[10px] font-bold text-center">
              <div>
                <p>Ketua Panitia</p>
                <div className="h-16"></div>
                <p className="font-extrabold text-slate-950 underline">{ketuaPanitia}</p>
              </div>
              <div>
                <p>{placeDate}</p>
                <p>Sekretaris Pertandingan</p>
                <div className="h-16"></div>
                <p className="font-extrabold text-slate-950 underline">{sekretaris}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
