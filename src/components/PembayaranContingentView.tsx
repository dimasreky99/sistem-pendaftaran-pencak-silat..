import React, { useState } from "react";
import { 
  CreditCard, CheckCircle, AlertCircle, UploadCloud, Image as ImageIcon, HelpCircle, FileText, Printer, ArrowLeft, Trash2, X
} from "lucide-react";
import { Athlete, Contingent, SystemSettings } from "../types";
import { motion } from "motion/react";

interface PembayaranContingentViewProps {
  contingent: Contingent;
  athletes: Athlete[];
  settings: SystemSettings;
  onUploadReceipt: (contingentName: string, base64Image: string) => void;
  onUpdatePaymentStatus?: (contingentName: string, status: "Lunas" | "Belum Lunas") => void; // Added for mock preview status toggling
}

export default function PembayaranContingentView({
  contingent,
  athletes,
  settings,
  onUploadReceipt,
  onUpdatePaymentStatus
}: PembayaranContingentViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [viewPaymentInfo, setViewPaymentInfo] = useState(true);
  const [showPrintInvoice, setShowPrintInvoice] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFER" | "QRIS">(settings.qrisPhotoUrl ? "QRIS" : "TRANSFER"); // Print view state

  const getInvoiceNumber = () => {
    if (contingent.customInvoiceNumber) return contingent.customInvoiceNumber;
    const invCount = settings.invoiceCounter || 1000;
    // We don't have the full contingents array here, but usually it's passed or we can use kodeUnik
    // Assuming `contingent.kodeUnik` is a unique number like 1, 2, 3...
    // Let's use kodeUnik to generate a consistent INV if no custom string
    return `INV-${String(invCount + contingent.kodeUnik).padStart(3, "0")}`;
  };

  // Filter athletes registered under this contingent
  const myAthletes = athletes.filter(a => a.kontingen === contingent.contingentName);

  // Group by category to count costs
  const categoryCounts = myAthletes.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.kategori] = (acc[curr.kategori] || 0) + 1;
    return acc;
  }, {});

  const subtotal = Object.keys(categoryCounts).reduce((acc, cat) => {
    const count = categoryCounts[cat];
    const unitPrice = settings.categoryPrices[cat] || 0;
    return acc + (unitPrice * count);
  }, 0);

  const totalBill = settings.isFree ? 0 : subtotal;

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
        const img = new Image();
        img.src = event.target.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const max_size = 800; // Limit image dimensions to 800px to keep storage usage low and prevent crashes
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            try {
              const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
              onUploadReceipt(contingent.contingentName, compressedBase64);
              alert("Sukses mengunggah bukti transfer! Mohon tunggu konfirmasi admin.");
            } catch (err) {
              // Fallback to original Base64 if canvas conversion fails
              onUploadReceipt(contingent.contingentName, event.target.result as string);
              alert("Sukses mengunggah bukti transfer! Mohon tunggu konfirmasi admin.");
            }
          } else {
            onUploadReceipt(contingent.contingentName, event.target.result as string);
            alert("Sukses mengunggah bukti transfer! Mohon tunggu konfirmasi admin.");
          }
        };
        img.onerror = () => {
          onUploadReceipt(contingent.contingentName, event.target.result as string);
          alert("Sukses mengunggah bukti transfer! Mohon tunggu konfirmasi admin.");
        };
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

  // Printable Invoice View
  if (showPrintInvoice) {
    return (
      <div className="bg-slate-100 min-h-screen p-6 md:p-10 text-slate-800">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm 15mm;
            }
            header, aside, footer, nav, .no-print {
              display: none !important;
            }
            body, html, #root, main {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            .print-invoice-box {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }
          }
        `}} />

        {/* Action Bar (hidden on print) */}
        <div className="max-w-4xl mx-auto flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl no-print mb-6 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrintInvoice(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl transition-all cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="font-extrabold text-sm md:text-base uppercase">Pratinjau Cetak Invoice Pembayaran</h2>
              <p className="text-[10px] text-slate-300 font-semibold mt-0.5">Kontingen: {contingent.contingentName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} /> Cetak Invoice
            </button>
            <button
              onClick={() => setShowPrintInvoice(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="print-invoice-box max-w-4xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-8">
          
          {/* Invoice Header / Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">INVOICE PEMBAYARAN RESMI</span>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{settings.eventTitle || "SILAT TOURNAMENT"}</h1>
              <p className="text-[10px] text-slate-500 font-semibold leading-normal max-w-md">
                Sistem Pendaftaran Turnamen Pencak Silat Digital Terintegrasi. 
              </p>
            </div>
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo Event" className="h-16 w-auto object-contain" />
            ) : (
              <div className="bg-emerald-600 text-white h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg">
                🏆
              </div>
            )}
          </div>

          {/* Billing Details Metadata */}
          <div className="grid grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Ditujukan Kepada (Kontingen)</span>
              <p className="text-slate-900 font-black uppercase text-sm">{contingent.contingentName}</p>
              <p>Penanggung Jawab: <span className="text-slate-900 font-bold">{contingent.pjName || "—"}</span></p>
              <p>No. WhatsApp: <span className="text-slate-900 font-bold font-mono">{contingent.nowa || "—"}</span></p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Rincian Dokumen</span>
              <p>Nomor Invoice: <span className="text-slate-950 font-black font-mono uppercase">{getInvoiceNumber()}</span></p>
              <p>Tanggal Cetak: <span className="text-slate-900 font-bold">{new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span></p>
              <p>Status Biaya: <span className={`text-xs font-black uppercase ${contingent.paymentStatus === "Lunas" ? "text-emerald-600" : "text-rose-600"}`}>{contingent.paymentStatus === "Lunas" ? "TERKONFIRMASI LUNAS" : "MENUNGGU PEMBAYARAN"}</span></p>
            </div>
          </div>

          {/* Detailed Itemized Costs */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-tight border-b border-slate-200 pb-2">Rincian Detail Pembayaran</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item Pembayaran (Kategori)</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Atlet</th>
                    <th className="py-2.5 px-3 text-right">Biaya Satuan</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                  {Object.keys(categoryCounts).map(cat => {
                    const count = categoryCounts[cat];
                    const unitPrice = settings.categoryPrices[cat] || 0;
                    return (
                      <tr key={cat} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 uppercase font-extrabold text-slate-900">Pendaftaran Kategori {cat}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-black">{count} Atlet</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatRupiah(unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-extrabold">{formatRupiah(unitPrice * count)}</td>
                      </tr>
                    );
                  })}
                  {/* Grand total row */}
                  <tr className="bg-slate-50 font-bold text-slate-900 text-sm">
                    <td className="py-3 px-3 uppercase font-black" colSpan={3}>Total Tagihan Akhir:</td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 text-base">
                      {formatRupiah(totalBill)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>



          {/* Printed Signatures */}
          <div className="grid grid-cols-2 text-center pt-8 text-xs font-semibold leading-relaxed">
            <div className="space-y-14">
              <p>Penanggung Jawab Kontingen,<br /><strong>{contingent.contingentName}</strong></p>
              <div className="mx-auto border-b border-slate-400 w-44 h-1"></div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">{contingent.pjName || "Tanda Tangan & Nama Terang"}</p>
            </div>
            <div className="space-y-14 relative">
              <p>Mengetahui,<br />Bendahara Panitia Pelaksana</p>
              
              {contingent.paymentStatus === "Lunas" ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-8">
                  {settings.stampUrl && <img src={settings.stampUrl} className="absolute h-24 opacity-60 ml-20" alt="Stempel" />}
                  {settings.signatureUrl && <img src={settings.signatureUrl} className="absolute h-16 z-10" alt="TTD" />}
                </div>
              ) : null}

              <div className="mx-auto border-b border-slate-400 w-44 h-1 relative z-20"></div>
              <p className="text-[10px] text-slate-800 uppercase font-bold relative z-20">
                {contingent.paymentStatus === "Lunas" && settings.treasurerName ? settings.treasurerName : "Tanda Tangan & Nama Terang"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
      className="space-y-6"
    >
      {/* Header Bar */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 text-[9px] font-black tracking-widest uppercase inline-block mb-1">
              💳 Administrasi Keuangan
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <CreditCard className="text-emerald-400" size={24} />
              STATUS BIAYA & PEMBAYARAN REGISTRASI
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Lakukan penyelesaian administrasi biaya pendaftaran untuk mengaktifkan seluruh fitur download ID Card resmi bagi kontingen <strong>{contingent.contingentName}</strong>.
            </p>
          </div>
        </div>
      </div>

      {settings.isFree ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
          <strong className="text-emerald-400 font-extrabold text-base block mb-1">MODE PENDAFTARAN GRATIS</strong>
          <span className="text-xs text-slate-400">Tidak ada biaya registrasi yang perlu diselesaikan pada event turnamen ini.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Billing Card */}
          <div className="lg:col-span-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">Rincian Invoice Pendaftaran</h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {myAthletes.length} Atlet Terdaftar
                </span>
              </div>

              {myAthletes.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Belum ada atlet yang didaftarkan oleh kontingen Anda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-slate-150 bg-white shadow-sm">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-150">
                        <tr>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3 text-center">Jumlah Atlet</th>
                          <th className="py-2.5 px-3 text-right">Biaya Satuan</th>
                          <th className="py-2.5 px-3 text-right">Total Biaya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {Object.keys(categoryCounts).map(cat => {
                          const count = categoryCounts[cat];
                          const unitPrice = settings.categoryPrices[cat] || 0;
                          return (
                            <tr key={cat} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 text-slate-900 font-extrabold uppercase">Kategori {cat}</td>
                              <td className="py-2.5 px-3 text-center font-mono font-black">{count} Atlet</td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatRupiah(unitPrice)}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-extrabold">{formatRupiah(unitPrice * count)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-2.5 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-slate-800 font-extrabold">
                      <span>Total Tagihan Atlet:</span>
                      <span>{formatRupiah(subtotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {settings.qrisPhotoUrl && (
              <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200 mt-4 max-w-sm print:hidden">
                <button
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-md transition-all ${paymentMethod === "TRANSFER" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Transfer Bank
                </button>
                <button
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-md transition-all ${paymentMethod === "QRIS" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  QRIS
                </button>
              </div>
            )}
            
            {settings.paymentInfo && (!settings.qrisPhotoUrl || paymentMethod === "TRANSFER") && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 text-xs font-semibold whitespace-pre-wrap leading-relaxed mt-4 print:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-2">Informasi & Petunjuk Rekening Pembayaran / Transfer Bank</span>
                {settings.paymentInfo}
              </div>
            )}
            
            {settings.qrisPhotoUrl && paymentMethod === "QRIS" && (
              <div className="p-4 bg-white border border-slate-150 rounded-2xl flex flex-col items-center mt-4 print:hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-3 text-center">Scan QRIS untuk Pembayaran</span>
                <img src={settings.qrisPhotoUrl} alt="QRIS" className="w-full max-w-[250px] h-auto rounded-xl border border-slate-200" />
              </div>
            )}

            {/* Drag and Drop Receipt Upload */}
            <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col print:hidden">
              <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-tight border-b border-slate-100 pb-4 mb-4">
                Upload Bukti Pembayaran
              </h3>

              {contingent.paymentStatus === "Lunas" ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200">
                  <CheckCircle size={40} className="text-emerald-500 mb-2.5" />
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
                  <CheckCircle size={40} className="text-emerald-500 mb-2.5" />
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
            
            <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Tagihan</span>
                <strong className="text-2xl font-black text-slate-950">{formatRupiah(totalBill)}</strong>
              </div>
              <div className="flex items-center gap-2">
                {contingent.paymentStatus === "Lunas" ? (
                  <button
                    onClick={() => setShowPrintInvoice(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileText size={14} /> Cetak Invoice
                  </button>
                ) : (
                  <p className="text-[10px] text-slate-500 font-semibold max-w-[200px] text-right italic">
                    Jika terkonfirmasi lunas maka invoice akan muncul.
                  </p>
                )}
              </div>
            </div>


          </div>

        </div>
      )}
    </motion.div>
  );
}
