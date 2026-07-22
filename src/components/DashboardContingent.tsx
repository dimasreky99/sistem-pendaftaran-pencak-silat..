import React, { useState } from "react";
import { 
  Users, CheckCircle2, AlertCircle, Search, HelpCircle, FileText, UploadCloud, Plus, RefreshCw, Image as ImageIcon, Phone
} from "lucide-react";
import { Athlete, Contingent, SystemSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DashboardContingentProps {
  contingent: Contingent;
  athletes: Athlete[];
  settings: SystemSettings;
  onNavigateToForm: () => void;
  onSelectAthleteForDetail: (athlete: Athlete) => void;
  onViewOfficialId: () => void;
  onUploadReceipt: (contingentName: string, base64Image: string) => void;
  onTriggerRefresh: () => void;
}

export default function DashboardContingent({
  contingent,
  athletes,
  settings,
  onNavigateToForm,
  onSelectAthleteForDetail,
  onViewOfficialId,
  onUploadReceipt,
  onTriggerRefresh
}: DashboardContingentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [viewPaymentInfo, setViewPaymentInfo] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchAthlete, setSearchAthlete] = useState("");

  // Filter athletes registered for this specific contingent
  const myAthletes = athletes.filter(a => a.kontingen === contingent.contingentName);
  
  const filteredAthletes = myAthletes.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.nik.includes(searchQuery)
  );

  // Bill breakdown
  const categoryCounts: Record<string, number> = {};
  myAthletes.forEach(a => {
    categoryCounts[a.kategori] = (categoryCounts[a.kategori] || 0) + 1;
  });

  const subtotal = myAthletes.reduce((acc, a) => {
    const price = settings.categoryPrices[a.kategori] || 0;
    return acc + price;
  }, 0);

  const totalBill = settings.isFree ? 0 : subtotal;

  const hasRevisions = myAthletes.some(a => !!a.revisiCatatan);

  // Drag & drop file handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Format berkas harus berupa gambar murni (JPG/PNG)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUploadReceipt(contingent.contingentName, event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Contingent Slat Card */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo Event" className="w-16 h-16 rounded-2xl object-contain bg-slate-800 p-1 border border-slate-700 shadow-inner" />
            )}
            <div className="space-y-2">
              <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest block">Dashboard Kontingen</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">{contingent.contingentName}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-semibold">
                <span>Penanggung Jawab: <strong className="text-slate-200">{contingent.pjName}</strong></span>
                <span>•</span>
                <span>WhatsApp: <strong className="text-slate-200">{contingent.nowa}</strong></span>
                {!settings.isFree && (
                  <>
                    <span>•</span>
                    <span>Status Keuangan: <strong className={contingent.paymentStatus === "Lunas" ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>{contingent.paymentStatus === "Lunas" ? "LUNAS" : "BELUM LUNAS"}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Official ID Badge */}
            <button
              onClick={onViewOfficialId}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-950/20 text-center cursor-pointer"
            >
              🪪 ID CARD OFFICIAL
            </button>
          </div>
        </div>
      </div>

      {/* Alarm Alert for Revisions Needed */}
      {hasRevisions && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-800 flex items-start gap-3.5 shadow-sm"
        >
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm">Pemberitahuan Revisi Berkas Atlet!</h4>
            <p className="text-xs text-rose-700 mt-1 font-semibold leading-relaxed">
              Terdapat atlet Anda yang membutuhkan perbaikan data atau upload ulang dokumen pendukung. Silakan periksa daftar atlet di bawah yang bertanda <span className="bg-rose-100 px-1 py-0.5 rounded text-rose-800 font-extrabold">⚠️ Revisi</span> dan klik tombol "Detail" untuk memperbaikinya segera.
            </p>
          </div>
        </motion.div>
      )}

      {/* Info Closed Pendaftaran */}
      {settings.regStatus === "OFF" && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm">Pendaftaran Ditutup Sementara</h4>
            <p className="text-xs text-amber-700 mt-1 font-semibold leading-relaxed">
              Pendaftaran atlet baru saat ini sedang ditangguhkan/ditutup oleh panitia pelaksana. Anda tetap dapat memantau status validasi data atlet Anda yang sudah didaftarkan sebelumnya.
            </p>
          </div>
        </div>
      )}

      {/* BILLING AND PAYMENT DETAILS MODAL */}
      <AnimatePresence>
        {isPaymentModalOpen && !settings.isFree && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-4xl bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-800 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base md:text-lg uppercase tracking-tight flex items-center gap-2">
                    💳 Rincian Biaya & Pembayaran Registrasi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    Selesaikan proses administrasi untuk dapat mengunduh dan mencetak ID Card resmi atlet Anda.
                  </p>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all font-black text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                {/* Invoice Breakdown */}
                <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                      <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-tight">Rincian Biaya Registrasi</h3>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        {myAthletes.length} Atlet
                      </span>
                    </div>

                    {myAthletes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8 font-medium">Belum ada atlet yang didaftarkan.</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-slate-150 bg-white">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-150">
                              <tr>
                                <th className="py-2 px-3">Kategori</th>
                                <th className="py-2 px-3 text-center">Atlet</th>
                                <th className="py-2 px-3 text-right">Biaya Satuan</th>
                                <th className="py-2 px-3 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold">
                              {Object.keys(categoryCounts).map(cat => {
                                const count = categoryCounts[cat];
                                const unitPrice = settings.categoryPrices[cat] || 0;
                                return (
                                  <tr key={cat}>
                                    <td className="py-2 px-3 text-slate-900 font-extrabold uppercase">Kategori {cat}</td>
                                    <td className="py-2 px-3 text-center font-mono font-black">{count} Atlet</td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-500">{formatRupiah(unitPrice)}</td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-800 font-extrabold">{formatRupiah(unitPrice * count)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="space-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                          <div className="flex justify-between text-slate-800 font-bold">
                            <span>Subtotal Atlet:</span>
                            <span>{formatRupiah(subtotal)}</span>
                          </div>
                          
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Pembayaran</span>
                      <strong className="text-xl lg:text-2xl font-black text-slate-900">{formatRupiah(totalBill)}</strong>
                    </div>
                    <button
                      onClick={() => setViewPaymentInfo(!viewPaymentInfo)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                    >
                      {viewPaymentInfo ? "Sembunyikan Info Rekening" : "Lihat No. Rekening"}
                    </button>
                  </div>

                  {viewPaymentInfo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-950 text-xs font-semibold whitespace-pre-wrap leading-relaxed"
                    >
                      {settings.paymentInfo}
                    </motion.div>
                  )}
                </div>

                {/* Drag and Drop Receipt Upload */}
                <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
                  <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-tight border-b border-slate-100 pb-4 mb-4">
                    Upload Bukti Pembayaran
                  </h3>

                  {contingent.paymentStatus === "Lunas" ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200">
                      <CheckCircle2 size={40} className="text-emerald-500 mb-2.5" />
                      <h4 className="font-bold text-emerald-800 text-sm">Pembayaran Terkonfirmasi</h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-semibold max-w-[200px]">
                        ID Card seluruh atlet Anda sekarang bebas diunduh dan dicetak!
                      </p>
                      {contingent.buktiTransferUrl && (
                        <a
                          href={contingent.buktiTransferUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:underline font-extrabold text-xs mt-4 flex items-center gap-1"
                        >
                          <ImageIcon size={14} /> Lihat Berkas Transfer
                        </a>
                      )}
                    </div>
                  ) : contingent.buktiTransferUrl ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <CheckCircle2 size={40} className="text-emerald-500 mb-2.5" />
                      <h4 className="font-bold text-slate-800 text-sm">Bukti Transfer Terkirim</h4>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold max-w-[200px]">
                        Bukti pembayaran sedang direview oleh Admin. File tidak dapat diubah lagi.
                      </p>
                      <a
                        href={contingent.buktiTransferUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 hover:underline font-extrabold text-xs mt-4 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl transition-colors"
                      >
                        <ImageIcon size={14} /> Lihat Berkas Transfer
                      </a>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between gap-4">
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`flex-1 min-h-[140px] flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                          dragActive 
                            ? "border-blue-600 bg-blue-50" 
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="file"
                          id="receiptInput"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileInput}
                        />
                        <label htmlFor="receiptInput" className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
                          <UploadCloud size={32} className="text-slate-400" />
                          <div>
                            <span className="text-xs text-slate-700 font-extrabold block">
                              Klik atau seret bukti transfer
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-1">Format: JPG, JPEG, atau PNG (Maks 5MB)</span>
                          </div>
                        </label>
                      </div>
                    </div>
                                    )}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all uppercase tracking-wider"
                >
                  Tutup Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Athletes Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 mt-8">
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau NIK atlet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={onTriggerRefresh}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 flex-1 md:flex-none"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
            <span className="hidden md:inline">Refresh</span>
          </button>
          <button
            onClick={onNavigateToForm}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-sm shadow-emerald-900/10 flex items-center justify-center gap-2 flex-1 md:flex-none uppercase tracking-wider"
          >
            <Plus size={16} />
            Tambah Atlet
          </button>
        </div>
      </div>

      {/* Desktop Athletes Table */}
      <div className="hidden md:block overflow-hidden bg-white border border-slate-200/60 rounded-3xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
              <th className="py-4 px-5 text-center" style={{ width: "60px" }}>No</th>
              <th className="py-4 px-5">Nama Atlet</th>
              <th className="py-4 px-5">Kategori & Kelas</th>
              <th className="py-4 px-5">NIK / Tgl Lahir</th>
              <th className="py-4 px-5 text-center">Status</th>
              <th className="py-4 px-5 text-center" style={{ width: "160px" }}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredAthletes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Belum ada data atlet didaftarkan.
                </td>
              </tr>
            ) : (
              filteredAthletes.map((atlet, index) => {
                const displayClass = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
                return (
                  <tr key={atlet.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 text-center text-slate-400">{index + 1}</td>
                    <td className="py-4 px-5 font-bold text-slate-900 uppercase">
                      {atlet.name}
                      {atlet.revisiCatatan && (
                        <div className="text-[10px] text-rose-600 font-bold mt-1 bg-rose-50 px-2 py-1 rounded inline-block">
                          Revisi: {atlet.revisiCatatan}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-emerald-800 font-bold uppercase">{atlet.kategori}</span>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5">{displayClass}</div>
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-mono">
                      <div>{atlet.nik}</div>
                      <div className="text-xs text-slate-400 font-semibold font-sans">{atlet.tglLahir}</div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                        atlet.isAcc
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {atlet.isAcc ? "✅ VALID" : "⏳ PROSES"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => onSelectAthleteForDetail(atlet)}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all uppercase tracking-wide"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
{/* Simplified Athlete Cards (Mobile only) */}
        <div className="block md:hidden space-y-3.5">
          {filteredAthletes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 border border-slate-150 rounded-2xl font-semibold text-xs">
              Belum ada data atlet didaftarkan.
            </div>
          ) : (
            filteredAthletes.map((atlet, index) => {
              const displayClass = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
              return (
                <div key={atlet.id} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 space-y-3.5 text-left shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Atlet #{index + 1}</span>
                      <strong className="text-slate-900 font-extrabold text-sm uppercase block mt-0.5">{atlet.name}</strong>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shrink-0 ${
                      atlet.isAcc
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {atlet.isAcc ? "✅ VALID" : "⏳ PROSES"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Kategori & Kelas</span>
                      <span className="font-extrabold text-emerald-800 block text-[11px] leading-tight uppercase">{atlet.kategori}</span>
                      <span className="text-[10px] text-slate-500 block font-bold leading-tight mt-0.5">{displayClass}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">NIK & Tgl Lahir</span>
                      <span className="font-extrabold text-slate-800 block text-[11px] font-mono">{atlet.nik}</span>
                      <span className="text-[10px] text-slate-500 block font-semibold mt-0.5">{atlet.tglLahir}</span>
                    </div>
                  </div>

                  {atlet.revisiCatatan && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-black p-3 rounded-xl leading-relaxed">
                      ⚠️ Catatan Revisi: {atlet.revisiCatatan}
                    </div>
                  )}

                  <button
                    onClick={() => onSelectAthleteForDetail(atlet)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] py-3 rounded-xl transition-all uppercase tracking-wider text-center cursor-pointer"
                  >
                    Detail & ID Card
                  </button>
                </div>
              );
            })
          )}
        </div>

      {/* Emergency Contact Block */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600 shrink-0">
            <Phone size={18} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Hubungi Kontak Darurat Admin</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Jika Anda mengalami kendala administrasi, pendaftaran atlet, kendala timbang badan, atau masalah pembayaran, silakan hubungi admin panitia pelaksana.
            </p>
          </div>
        </div>
        {(() => {
          const contingentsStr = localStorage.getItem("silat_contingents");
          let adminPhone = "6282123456789";
          if (contingentsStr) {
            try {
              const contingentsList = JSON.parse(contingentsStr);
              const adminUser = contingentsList.find((c: any) => c.role === "admin");
              if (adminUser && adminUser.nowa) {
                adminPhone = adminUser.nowa.replace(/\D/g, "");
                if (adminPhone.startsWith("0")) {
                  adminPhone = "62" + adminPhone.substring(1);
                }
              }
            } catch (e) {}
          }
          return (
            <a 
              href={`https://wa.me/${adminPhone}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-900/10 flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Chat WhatsApp Admin</span>
            </a>
          );
        })()}
      </div>

    </div>
  );
}
