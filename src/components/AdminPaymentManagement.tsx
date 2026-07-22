import React, { useState } from "react";
import { 
  CreditCard, Search, FileText, CheckCircle2, AlertCircle, Edit3, Save, X, Printer, 
  ChevronRight, Eye, Phone, RefreshCw, Layers, Sparkles
} from "lucide-react";
import { Athlete, Contingent, SystemSettings } from "../types";

interface AdminPaymentManagementProps {
  contingents: Contingent[];
  athletes: Athlete[];
  settings: SystemSettings;
  onUpdateContingentPaymentStatus: (contingentId: string, status: "Lunas" | "Belum Lunas") => void;
  onUpdateContingentNominalRevisi: (contingentId: string, nominal?: number) => void;
  onUpdateInvoiceNumber?: (contingentId: string, invoiceNum: string) => void;
}

export default function AdminPaymentManagement({
  contingents,
  athletes,
  settings,
  onUpdateContingentPaymentStatus,
  onUpdateContingentNominalRevisi,
  onUpdateInvoiceNumber
}: AdminPaymentManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"semua" | "lunas" | "belum_lunas" | "bukti">("semua");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNominal, setTempNominal] = useState("");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [isPreviewReportOpen, setIsPreviewReportOpen] = useState(false);

  // Helper formatting currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter out non-contingent (e.g. master admin has admin role)
  const contingentUsers = contingents.filter(c => c.role === "kontingen");

  // Build mapping with calculations
  const calculatedData = contingentUsers.map(contingent => {
    const myAthletes = athletes.filter(a => a.kontingen === contingent.contingentName);
    
    // Group categories
    const categoriesMap: Record<string, number> = {};
    myAthletes.forEach(a => {
      categoriesMap[a.kategori] = (categoriesMap[a.kategori] || 0) + 1;
    });

    const categoriesList = Object.entries(categoriesMap).map(([cat, count]) => `${count}x ${cat}`);

    const subtotal = Object.keys(categoriesMap).reduce((acc, cat) => {
      const count = categoriesMap[cat];
      const unitPrice = settings.categoryPrices[cat] || 0;
      return acc + (unitPrice * count);
    }, 0);

    const originalBill = settings.isFree ? 0 : subtotal;
    const finalBill = contingent.nominalRevisi !== undefined ? contingent.nominalRevisi : originalBill;

    return {
      contingent,
      athleteCount: myAthletes.length,
      categoriesList,
      categoriesMap,
      originalBill,
      finalBill,
      isOverridden: contingent.nominalRevisi !== undefined,
      hasProof: !!contingent.buktiTransferUrl
    };
  });

  // Apply search and status filters
  const filteredData = calculatedData.filter(item => {
    const matchesSearch = 
      item.contingent.contingentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contingent.pjName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contingent.nowa.includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === "lunas") {
      return item.contingent.paymentStatus === "Lunas";
    }
    if (statusFilter === "belum_lunas") {
      return item.contingent.paymentStatus === "Belum Lunas";
    }
    if (statusFilter === "bukti") {
      return item.hasProof;
    }
    return true;
  });

  const handleStartEdit = (id: string, currentVal: number) => {
    setEditingId(id);
    setTempNominal(currentVal.toString());
  };

  const handleSaveNominal = (id: string) => {
    const parsed = parseInt(tempNominal);
    if (isNaN(parsed) || parsed < 0) {
      alert("Masukkan angka nominal revisi yang valid!");
      return;
    }
    onUpdateContingentNominalRevisi(id, parsed);
    setEditingId(null);
  };

  const handleResetNominal = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus revisi nominal dan kembali ke tagihan asli?")) {
      onUpdateContingentNominalRevisi(id, undefined);
      setEditingId(null);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 print:p-0">
      
      {/* HEADER BAR (Hidden on Print) */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl border border-slate-800 print:hidden">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="bg-emerald-500 p-3.5 rounded-2xl text-slate-900 shadow-lg shadow-emerald-500/20">
            <CreditCard size={28} />
          </div>
          <div>
            <h2 className="font-black text-xl md:text-2xl tracking-tight uppercase">
              Manajemen Administrasi & Pembayaran
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Validasi bukti bayar, revisi nominal pendaftaran kontingen, serta preview/cetak laporan pendaftaran.
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsPreviewReportOpen(!isPreviewReportOpen)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all border flex items-center gap-2 ${
              isPreviewReportOpen 
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/10" 
                : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <Eye size={14} />
            {isPreviewReportOpen ? "Tutup Preview Laporan" : "Preview Laporan Cetak"}
          </button>

          <button
            onClick={triggerPrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow"
          >
            <Printer size={14} />
            CETAK PDF LAPORAN
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS CONTROLS (Hidden on Print) */}
      {!isPreviewReportOpen && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 print:hidden">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama kontingen, penanggung jawab, atau nomor WA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setStatusFilter("semua")}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  statusFilter === "semua" ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                Semua ({calculatedData.length})
              </button>
              <button
                onClick={() => setStatusFilter("lunas")}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  statusFilter === "lunas" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Lunas ({calculatedData.filter(i => i.contingent.paymentStatus === "Lunas").length})
              </button>
              <button
                onClick={() => setStatusFilter("belum_lunas")}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  statusFilter === "belum_lunas" ? "bg-rose-600 text-white shadow-sm" : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                Belum Lunas ({calculatedData.filter(i => i.contingent.paymentStatus === "Belum Lunas").length})
              </button>
              <button
                onClick={() => setStatusFilter("bukti")}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  statusFilter === "bukti" ? "bg-amber-600 text-white shadow-sm" : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                Ada Bukti Transfer ({calculatedData.filter(i => i.hasProof).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE PAYMENT TABLE (Hidden on Print if Preview is not toggled) */}
      {!isPreviewReportOpen ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden print:hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              Daftar Administrasi Pembayaran Kontingen ({filteredData.length})
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-inner">
              Klik nominal atau icon pensil untuk merevisi tagihan secara manual.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="py-3.5 px-6">Kontingen / PJ</th>
                  <th className="py-3.5 px-4 text-center">Atlet</th>
                  <th className="py-3.5 px-4">Kategori Terpilih</th>
                  
                  <th className="py-3.5 px-4 text-center">Bukti Bayar</th>
                  <th className="py-3.5 px-4 text-center">Aksi Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                 {filteredData.length > 0 ? (
                  filteredData.map(({ contingent, athleteCount, categoriesList, categoriesMap, originalBill, finalBill, isOverridden, hasProof }) => (
                    <tr key={contingent.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name / PJ */}
                      <td className="py-4 px-6 space-y-1.5">
                        <div className="font-black text-slate-900 uppercase text-xs leading-none">
                          {contingent.contingentName}
                        </div>
                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 font-semibold">
                          <span>PJ: {contingent.pjName || "—"}</span>
                          <span className="flex items-center gap-1 mt-0.5 font-mono text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                            <Phone size={10} /> {contingent.nowa}
                          </span>
                        </div>
                      </td>

                      {/* Participant count */}
                      <td className="py-4 px-4 text-center">
                        <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-mono font-black text-slate-800">
                          {athleteCount}
                        </span>
                      </td>

                      {/* Category List */}
                      <td className="py-4 px-4 max-w-sm">
                        {categoriesList.length > 0 ? (
                          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 shadow-inner">
                            {Object.entries(categoriesMap).map(([cat, count]) => {
                              const price = settings.categoryPrices[cat] || 0;
                              const numCount = Number(count) || 0;
                              return (
                                <div key={cat} className="flex justify-between items-center gap-2 text-[10px] font-bold text-slate-700 leading-normal border-b border-slate-100 last:border-b-0 pb-1 last:pb-0">
                                  <span className="uppercase text-slate-900 font-extrabold">{numCount}x Kategori {cat}</span>
                                  <span className="text-slate-400">@ {formatRupiah(price)}</span>
                                  <span className="font-black text-slate-800 font-mono">{formatRupiah(price * numCount)}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Belum mendaftarkan atlet</span>
                        )}
                      </td>

                      {/* Receipt Upload Proof */}
                      <td className="py-4 px-4 text-center">
                        {hasProof ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <button
                              onClick={() => setSelectedProofUrl(contingent.buktiTransferUrl)}
                              className="group relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:ring-2 hover:ring-emerald-500 transition-all flex items-center justify-center bg-slate-50"
                            >
                              <img src={contingent.buktiTransferUrl} alt="Bukti" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye size={12} />
                              </div>
                            </button>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase">Ada Bukti</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">No receipt upload</span>
                        )}
                      </td>

                      {/* Action status button */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            const newStatus = contingent.paymentStatus === "Lunas" ? "Belum Lunas" : "Lunas";
                            onUpdateContingentPaymentStatus(contingent.id, newStatus);
                          }}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                            contingent.paymentStatus === "Lunas"
                              ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-sm"
                              : "bg-white hover:bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300"
                          }`}
                        >
                          {contingent.paymentStatus === "Lunas" ? "✅ LUNAS" : "❌ BELUM LUNAS"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      Tidak ada data pendaftaran/pembayaran kontingen yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* FULL PRINTABLE REPORT PREVIEW & RAW PRINT MODE */}
      {(isPreviewReportOpen || true) && (
        <div className={`bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-md space-y-6 ${isPreviewReportOpen ? "block" : "hidden print:block"} print:border-none print:shadow-none print:p-0`}>
          
          {/* Header Report */}
          <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
            <h1 className="text-xl md:text-2xl font-black text-slate-950 uppercase tracking-tight leading-tight">
              LAPORAN KEUANGAN & PEMBAYARAN KONTINGEN
            </h1>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Turnamen Silat: {settings.eventTitle || "SILAT REGIONAL TOURNAMENT"}
            </p>
            <p className="text-[10px] font-bold text-slate-500 font-mono">
              Dicetak pada: {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date().toLocaleTimeString("id-ID")}
            </p>
          </div>

          {/* Table Report */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 font-bold text-slate-800 text-[10px] uppercase">
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Nama Kontingen</th>
                <th className="py-2.5 px-3">Penanggung Jawab</th>
                <th className="py-2.5 px-3 text-center">Jumlah Atlet</th>
                <th className="py-2.5 px-3">Kategori Terdaftar</th>
                <th className="py-2.5 px-3 text-right">Tagihan Akhir</th>
                <th className="py-2.5 px-3 text-center">Status Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {calculatedData.map(({ contingent, athleteCount, categoriesList, finalBill }, index) => (
                <tr key={contingent.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-[11px]">{index + 1}</td>
                  <td className="py-3 px-3 font-bold uppercase">{contingent.contingentName}</td>
                  <td className="py-3 px-3">{contingent.pjName} ({contingent.nowa})</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">{athleteCount}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] leading-relaxed block max-w-xs">{categoriesList.join(", ") || "—"}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">{formatRupiah(finalBill)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${contingent.paymentStatus === "Lunas" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {contingent.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              
              {/* Grand totals row */}
              <tr className="border-t-2 border-slate-800 font-bold bg-slate-50 text-slate-900 text-xs">
                <td colSpan={3} className="py-3 px-3 text-right uppercase font-black">Total Keseluruhan:</td>
                <td className="py-3 px-3 text-center font-mono font-black text-sm">
                  {calculatedData.reduce((sum, item) => sum + item.athleteCount, 0)} Atlet
                </td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3 text-right font-mono font-black text-sm text-emerald-800">
                  {formatRupiah(calculatedData.reduce((sum, item) => sum + item.finalBill, 0))}
                </td>
                <td className="py-3 px-3 text-center text-[10px] text-slate-500 uppercase tracking-widest font-black">
                  Lunas: {calculatedData.filter(i => i.contingent.paymentStatus === "Lunas").length} Kontingen
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Signatures for printed layout */}
          <div className="grid grid-cols-2 text-center pt-16 text-xs font-semibold">
            <div className="space-y-16">
              <p>Mengetahui,<br />Ketua Panitia Pelaksana</p>
              <div className="mx-auto border-b border-slate-400 w-48 h-1"></div>
              <p className="text-[10px] text-slate-400 uppercase">Tanda Tangan & Nama Terang</p>
            </div>
            <div className="space-y-16">
              <p>Bendahara Turnamen / Admin Keuangan</p>
              <div className="mx-auto border-b border-slate-400 w-48 h-1"></div>
              <p className="text-[10px] text-slate-400 uppercase">Tanda Tangan & Nama Terang</p>
            </div>
          </div>
        </div>
      )}

      {/* PROOF IMAGE DIALOG / POPUP MODAL */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 p-5 flex flex-col items-stretch relative">
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-full transition-colors shadow"
            >
              <X size={18} />
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
              Pratinjau Bukti Transfer Resmi
            </h3>
            <div className="bg-slate-100 rounded-2xl overflow-hidden flex-1 max-h-[500px] flex items-center justify-center p-2">
              <img src={selectedProofUrl} alt="Bukti Transfer Detail" className="max-w-full max-h-full object-contain rounded-xl" />
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
