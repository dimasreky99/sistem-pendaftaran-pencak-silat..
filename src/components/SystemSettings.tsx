import React, { useState } from "react";
import { 
  Settings, ShieldAlert, Award, Calendar, Image as ImageIcon, DollarSign, Plus, Trash2, ArrowUpRight, HelpCircle, HardDriveDownload
} from "lucide-react";
import { SystemSettings, CategoryConfig } from "../types";
import { generateDummyAthletes } from "../dummy";

import { DEFAULT_KELAS_IPSI } from "../constants";

interface SystemSettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onResetSystem: () => void;
}


  const handleDownloadBackup = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("silat_")) {
        const val = localStorage.getItem(key);
        try {
          backupData[key] = JSON.parse(val || "{}");
        } catch {
          backupData[key] = val;
        }
      }
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_silat_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("Backup data berhasil diunduh");
  };

export default function SystemSettingsComponent({
  settings,
  onUpdateSettings,
  onResetSystem
}: SystemSettingsProps) {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [regStart, setRegStart] = useState(settings.regStart || "");
  const [regEnd, setRegEnd] = useState(settings.regEnd || "");
  const [idCardBgColor, setIdCardBgColor] = useState(settings.idCardBgColor);
  const [isIpsiCollapseOpen, setIsIpsiCollapseOpen] = useState(false);
  const [ipsiActiveTab, setIpsiActiveTab] = useState<"prestasi" | "pemasalan">("prestasi");
  const [isPrestasiOpen, setIsPrestasiOpen] = useState(false);
  const [isPemasalanOpen, setIsPemasalanOpen] = useState(false);
  const [isSekretariatSettingsOpen, setIsSekretariatSettingsOpen] = useState(false);

  // Custom non-blocking notification & modal states to prevent iframe browser blocking
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{ title: string; message: string; onConfirm: () => void; onCancel?: () => void } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Custom Fields & Photo Labels management states
  const [newCustomField, setNewCustomField] = useState("");
  const [newPhotoLabel, setNewPhotoLabel] = useState("");

  const handleUpdateBasic = (key: keyof SystemSettings, val: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleToggleReg = () => {
    const nextStatus = localSettings.regStatus === "ON" ? "OFF" : "ON";
    setLocalSettings(prev => ({
      ...prev,
      regStatus: nextStatus,
      regStart: "",
      regEnd: ""
    }));
    setRegStart("");
    setRegEnd("");
  };

  const handleSaveSchedule = () => {
    if ((regStart && !regEnd) || (!regStart && regEnd)) {
      showToast("Harap isi kedua waktu (Mulai & Selesai) atau kosongkan keduanya!", "error");
      return;
    }
    if (regStart && regEnd && regStart >= regEnd) {
      showToast("Waktu Selesai harus lebih lambat dibanding waktu Mulai!", "error");
      return;
    }

    setLocalSettings(prev => ({
      ...prev,
      regStart,
      regEnd,
      regStatus: regStart && regEnd ? "ON" : prev.regStatus
    }));
    showToast("Jadwal pendaftaran otomatis diperbarui secara lokal. Ingat untuk klik tombol 'Simpan Pengaturan' di bawah untuk menyimpan permanen!", "info");
  };

  const handleCategoryPriceChange = (category: string, price: number) => {
    setLocalSettings(prev => ({
      ...prev,
      categoryPrices: {
        ...prev.categoryPrices,
        [category]: price
      }
    }));
  };

  const handleToggleCategoryActive = (category: string) => {
    setLocalSettings(prev => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[category] = {
        ...updatedClassData[category],
        active: !updatedClassData[category].active
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };

  const handleToggleCategoryBebas = (category: string) => {
    setLocalSettings(prev => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[category] = {
        ...updatedClassData[category],
        isBebas: !updatedClassData[category].isBebas
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };

  const handleUpdateYearBounds = (category: string, bound: "min" | "max", val: number) => {
    setLocalSettings(prev => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[category] = {
        ...updatedClassData[category],
        [bound === "min" ? "minYear" : "maxYear"]: val
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };

  // Add/remove custom registration inputs
  const handleAddCustomField = () => {
    if (!newCustomField.trim()) return;
    setLocalSettings(prev => ({
      ...prev,
      customFields: [...prev.customFields, newCustomField.trim()]
    }));
    setNewCustomField("");
  };

  const handleRemoveCustomField = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, idx) => idx !== index)
    }));
  };

  // Add/remove required upload files
  const handleAddPhotoLabel = () => {
    if (!newPhotoLabel.trim()) return;
    setLocalSettings(prev => ({
      ...prev,
      photoLabels: [...prev.photoLabels, newPhotoLabel.trim()]
    }));
    setNewPhotoLabel("");
  };

  const handleRemovePhotoLabel = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      photoLabels: prev.photoLabels.filter((_, idx) => idx !== index)
    }));
  };

  // Convert files to Base64 (Logo/ID Card background)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        showToast("Berkas wajib berupa gambar murni!", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleUpdateBasic("logoUrl", event.target.result as string);
          showToast("Logo aplikasi sukses diperbarui secara lokal!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdCardBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        showToast("Berkas wajib berupa gambar murni!", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleUpdateBasic("idCardBg", event.target.result as string);
          showToast("Desain background ID Card lanyard sukses diperbarui secara lokal!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetClassDataToIpsi = () => {
    setCustomConfirm({
      title: "Setel Ulang Data Kelas Standar?",
      message: "Apakah Anda yakin ingin menyetel ulang data kelas ke standar baku IPSI? Semua penyesuaian kustom kelas Anda saat ini akan ditimpa.",
      onConfirm: () => {
        setLocalSettings(prev => ({
          ...prev,
          classData: JSON.parse(JSON.stringify(DEFAULT_KELAS_IPSI))
        }));
        showToast("Data Kategori Kelas IPSI berhasil dipulihkan secara lokal!", "success");
      }
    });
  };

  const handleSaveChangesAll = () => {
    onUpdateSettings(localSettings);
    showToast("💾 PENGATURAN ADMIN BERHASIL DISIMPAN KE SISTEM!", "success");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
        <div className="bg-slate-900 p-2.5 rounded-xl text-white">
          <Settings size={22} />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-none uppercase">
            Pengaturan Sistem Turnamen
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Atur kebijakan pendaftaran, biaya registrasi, kategori, dan logistik turnamen.</p>
        </div>
      </div>

      {/* Grid of Bento Settings Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BENTO 1: REGISTRATION WINDOW CONTROL */}
        <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar size={16} className="text-emerald-600" />
            Jendela Pendaftaran Atlet
          </h3>

          {/* Manual Switch */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-150">
            <div>
              <strong className="text-xs font-bold text-slate-800 block">Buka/Tutup Manual</strong>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                Pendaftaran saat ini: {localSettings.regStatus === "ON" ? "🔓 DIBUKA" : "🔒 DITUTUP"}
              </span>
            </div>
            <button
              onClick={handleToggleReg}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                localSettings.regStatus === "ON"
                  ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                  : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              }`}
            >
              {localSettings.regStatus === "ON" ? "TUTUP REGISTRASI" : "BUKA REGISTRASI"}
            </button>
          </div>

          {/* Automated Scheduler */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs text-slate-700">📅 Atur Jadwal Otomatis (Opsional)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Waktu Mulai</label>
                <input
                  type="datetime-local"
                  value={regStart}
                  onChange={(e) => setRegStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Waktu Selesai</label>
                <input
                  type="datetime-local"
                  value={regEnd}
                  onChange={(e) => setRegEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleSaveSchedule}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
            >
              Simpan Jadwal Otomatis
            </button>
          </div>
        </div>

        {/* BENTO 2: BASIC BRANDING */}
        <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award size={16} className="text-emerald-600" />
            Detail & Logo Turnamen
          </h3>

          <div className="space-y-4">
            {/* Event Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Nama Resmi Turnamen / Event</label>
              <input
                type="text"
                value={localSettings.eventTitle}
                onChange={(e) => handleUpdateBasic("eventTitle", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Event Dates (Start & End) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Mulai Pertandingan</label>
                <input
                  type="date"
                  value={localSettings.eventStartDate || ""}
                  onChange={(e) => handleUpdateBasic("eventStartDate", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Selesai Pertandingan</label>
                <input
                  type="date"
                  value={localSettings.eventEndDate || ""}
                  onChange={(e) => handleUpdateBasic("eventEndDate", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BENTO 2B: SEKRETARIAT PERTANDINGAN SETTINGS */}
        <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
          <button
            type="button"
            onClick={() => setIsSekretariatSettingsOpen(!isSekretariatSettingsOpen)}
            className="w-full flex items-center justify-between border-b border-slate-100 pb-3 text-left cursor-pointer"
          >
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2">
              <Award size={16} className="text-emerald-600" />
              Pengaturan Sekretariat Pertandingan
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {isSekretariatSettingsOpen ? "▲ TUTUP" : "▼ KLIK UNTUK MEMBUKA"}
            </span>
          </button>

          {isSekretariatSettingsOpen && (
            <div className="space-y-4 pt-1 animate-fadeIn">
              {/* Match Type limit */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Skema Pertandingan yang Dibuka</label>
                <select
                  value={localSettings.matchType}
                  onChange={(e) => handleUpdateBasic("matchType", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Keduanya">🏆 Prestasi & 🏅 Pemasalan (Keduanya)</option>
                  <option value="Prestasi">🏆 Prestasi Saja</option>
                  <option value="Pemasalan">🏅 Pemasalan Saja</option>
                </select>
              </div>

              {/* Best Fighter Scheme selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Skema Kategori Pesilat Terbaik</label>
                <select
                  value={localSettings.bestFighterScheme || "Per Kategori Umur"}
                  onChange={(e) => handleUpdateBasic("bestFighterScheme", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Per Kategori Umur">👶/🧒/👦/👨 Per Kategori Umur (Dini, Pra Remaja, Remaja, Dewasa)</option>
                  <option value="Prestasi">🏆 Hanya 1 Putra & 1 Putri Kategori Prestasi</option>
                  <option value="Pemasalan">🏅 Hanya 1 Putra & 1 Putri Kategori Pemasalan</option>
                  <option value="Keduanya">🤝 1 Putra & 1 Putri Per Kategori Prestasi + Pemasalan</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* BENTO 3: FINANCE & INVOICING */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign size={16} className="text-emerald-600" />
            Biaya Registrasi & Keuangan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className={`${localSettings.isFree ? "md:col-span-12" : "md:col-span-5"} space-y-4`}>
              {/* Is Free Toggle */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div>
                  <strong className="text-xs font-bold text-slate-800 block">Mode Gratis Ongkos</strong>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                    Semua registrasi bebas biaya pendaftaran.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.isFree}
                  onChange={(e) => {
                    handleUpdateBasic("isFree", e.target.checked);
                  }}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Payment Instruction Text Area */}
              {!localSettings.isFree && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Instruksi Pembayaran & Rekening</label>
                  <textarea
                    rows={4}
                    value={localSettings.paymentInfo}
                    onChange={(e) => handleUpdateBasic("paymentInfo", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none leading-relaxed"
                  />
                  
                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Gambar QRIS (Opsional)</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");
                                let w = img.width;
                                let h = img.height;
                                const max_size = 1200; // QR code needs good resolution
                                if (w > h) {
                                  if (w > max_size) { h *= max_size / w; w = max_size; }
                                } else {
                                  if (h > max_size) { w *= max_size / h; h = max_size; }
                                }
                                canvas.width = w;
                                canvas.height = h;
                                ctx?.drawImage(img, 0, 0, w, h);
                                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                                handleUpdateBasic("qrisPhotoUrl", compressedBase64);
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs w-full sm:w-auto"
                      />
                      {localSettings.qrisPhotoUrl && (
                        <div className="relative">
                          <img src={localSettings.qrisPhotoUrl} alt="QRIS" className="w-24 rounded-lg border shadow-sm" />
                          <button
                            type="button"
                            onClick={() => handleUpdateBasic("qrisPhotoUrl", "")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                                        <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">No. Awal Invoice (Prefix Angka)</label>
                      <input
                        type="number"
                        value={localSettings.invoiceCounter || 1000}
                        onChange={(e) => handleUpdateBasic("invoiceCounter", parseInt(e.target.value) || 1000)}
                        placeholder="Contoh: 1000"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
<div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Nama Bendahara Panitia (Cetak Invoice)</label>
                      <input
                        type="text"
                        value={localSettings.treasurerName || ""}
                        onChange={(e) => handleUpdateBasic("treasurerName", e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Tanda Tangan Bendahara (Upload File)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => handleUpdateBasic("signatureUrl", ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs"
                      />
                      {localSettings.signatureUrl && <img src={localSettings.signatureUrl} className="h-10 mt-2 object-contain" alt="TTD" />}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Stempel Panitia (Upload File)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => handleUpdateBasic("stampUrl", ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs"
                      />
                      {localSettings.stampUrl && <img src={localSettings.stampUrl} className="h-12 mt-2 object-contain" alt="Stempel" />}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing per category - HIDE COMPLETELY IF FREE MODE */}
            {!localSettings.isFree && (
              <div className="md:col-span-7 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1">
                  💰 Atur Tarif per Kategori Usia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-2">
                  {Object.keys(localSettings.classData).map((cat) => {
                    const val = localSettings.categoryPrices[cat] || 0;
                    return (
                      <div key={cat} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{cat}</span>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => handleCategoryPriceChange(cat, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-xs font-bold text-slate-800"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BENTO 4: CUSTOM FIELDS CREATOR / INFORMASI PRIBADI ATLET */}
        <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings size={16} className="text-emerald-600" />
            Form Informasi Pribadi Atlet (Lengkap)
          </h3>

          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              📋 Informasi Pribadi Standar (Baku & Otomatis)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider col-span-1 sm:col-span-2 mb-1">
                Ubah Label Input Formulir Peserta (Baku & Otomatis)
              </p>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label Nama Lengkap</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.namaLengkap || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.namaLengkap = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="Nama Lengkap"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label NIK / No. Identitas</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.nik || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.nik = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="NIK (Nomor Induk Kependudukan)"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label Tanggal Lahir</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.tglLahir || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.tglLahir = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="Tanggal Lahir (Otomatis)"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label Jenis Kelamin</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.jk || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.jk = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="Jenis Kelamin"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label No. WhatsApp</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.nowa || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.nowa = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="No. WhatsApp Atlet/Wali"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label Tinggi Badan</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.tinggiBadan || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.tinggiBadan = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="Tinggi Badan (cm)"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label Berat Badan</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.beratBadan || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.beratBadan = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="Berat Badan (kg)"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label Alamat Lengkap</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.alamat || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.alamat = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="Alamat Lengkap"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label Asal Kontingen / Sekolah</label>
                <input
                  type="text"
                  value={localSettings.standardFieldLabels?.kontingen || ""}
                  onChange={(e) => {
                    const updatedLabels = { ...(localSettings.standardFieldLabels || {}) };
                    updatedLabels.kontingen = e.target.value;
                    setLocalSettings(prev => ({ ...prev, standardFieldLabels: updatedLabels }));
                  }}
                  placeholder="Asal Kontingen / Sekolah / Instansi"
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              ➕ Tambahan Pertanyaan Khusus / Kustom
            </span>
            {/* List of Custom Questions */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {localSettings.customFields.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium py-3 text-center bg-slate-50 rounded-xl border border-slate-150 border-dashed">
                  Formulir bersih dari pertanyaan kustom tambahan. Klik tombol "+" di bawah untuk menambah.
                </p>
              ) : (
                localSettings.customFields.map((f, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">{f}</span>
                    <button
                      onClick={() => handleRemoveCustomField(index)}
                      className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Creator block */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Cth: Nama Pelatih / Sabuk..."
                value={newCustomField}
                onChange={(e) => setNewCustomField(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
              <button
                onClick={handleAddCustomField}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 rounded-xl transition-all shrink-0 flex items-center justify-center gap-1"
                title="Tambah Pertanyaan Formulir"
              >
                <span>+</span> Tambah
              </button>
            </div>
          </div>
        </div>

        {/* BENTO 5: REQUIRED BERKAS DOCUMENT SETUP */}
        <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <Plus size={16} className="text-emerald-600" />
            Tambahan Syarat Berkas Upload
          </h3>

          {/* List of Upload documents required */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {localSettings.photoLabels.length === 0 ? (
              <p className="text-[11px] text-slate-400 font-medium py-4 text-center">Registrasi tanpa syarat upload berkas.</p>
            ) : (
              localSettings.photoLabels.map((l, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="text-xs font-bold text-slate-700">{l}</span>
                  <button
                    onClick={() => handleRemovePhotoLabel(index)}
                    className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Creator block */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cth: KK / Surat Sehat..."
              value={newPhotoLabel}
              onChange={(e) => setNewPhotoLabel(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
            <button
              onClick={handleAddPhotoLabel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 rounded-xl transition-all shrink-0"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* BENTO 6: FILE & IMAGES ASSET UPLOAD */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon size={16} className="text-emerald-600" />
            Logo & Desain Background Badge ID Card
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Logo */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">1. Logo Resmi (Akan Muncul pada Badge Lanyard & Form)</label>
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                <input
                  type="file"
                  id="logoUploadInput"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="logoUploadInput"
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                >
                  Upload Logo
                </label>
                {localSettings.logoUrl ? (
                  <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                    <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">Kosong (Default)</span>
                )}
              </div>
            </div>

            {/* ID Card Background / Template Theme */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">2. Background & Lanyard Badge ID Card</label>
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                {/* Image upload background */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="bgBadgeInput"
                    accept="image/*"
                    onChange={handleIdCardBgUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="bgBadgeInput"
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    Custom Background
                  </label>
                  {localSettings.idCardBg ? (
                    <span className="text-[10px] text-emerald-600 font-bold">Terupload (Aktif)</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">Memakai Warna Lanyard</span>
                  )}
                </div>

                {/* Dropdown for pre-styled lanyard color theme */}
                {!localSettings.idCardBg && (
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500">Preset Lanyard Color</span>
                    <select
                      value={idCardBgColor}
                      onChange={(e) => {
                        setIdCardBgColor(e.target.value);
                        handleUpdateBasic("idCardBgColor", e.target.value);
                      }}
                      className="px-2 py-1 bg-slate-50 border border-slate-150 rounded text-xs font-bold text-slate-800"
                    >
                      <option value="slate">🔘 Shadow Terate (Hitam/Perak)</option>
                      <option value="red">🔴 Red Fire (Merah/Maroon)</option>
                      <option value="green">🟢 Emerald IPSI (Hijau/Emas)</option>
                      <option value="blue">🔵 Royal Blue (Biru/Emas)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BENTO 7: IPSI CATEGORIES RANGE AND YEARS MANAGER */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setIsIpsiCollapseOpen(!isIpsiCollapseOpen)}
              className="flex items-center gap-2 font-extrabold text-slate-900 text-sm uppercase tracking-tight text-left cursor-pointer"
            >
              <Settings size={16} className="text-emerald-600" />
              Kelola Rentang Tahun Lahir Kategori IPSI
              <span className="text-xs text-slate-400 font-bold ml-1">
                {isIpsiCollapseOpen ? "▲ TUTUP" : "▼ KLIK UNTUK MEMBUKA"}
              </span>
            </button>
            {isIpsiCollapseOpen && (
              <button
                type="button"
                onClick={handleResetClassDataToIpsi}
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-[10px] px-3 py-1.5 rounded-lg border border-rose-200 uppercase"
              >
                🔄 Reset IPSI Default
              </button>
            )}
          </div>

          {isIpsiCollapseOpen && (
            <div className="space-y-4">
              
              {/* DROPDOWN 1: KATEGORI PRESTASI */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsPrestasiOpen(!isPrestasiOpen)}
                  className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors font-extrabold text-xs text-slate-800 uppercase text-left cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">🏆 Kategori Prestasi</span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {isPrestasiOpen ? "▲ TUTUP" : "▼ KLIK UNTUK MEMBUKA"}
                  </span>
                </button>

                {isPrestasiOpen && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto animate-fadeIn">
                    {Object.keys(localSettings.classData)
                      .map((cat) => {
                        const config = localSettings.classData[cat];
                        return (
                          <div key={cat} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-left shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-800 text-xs truncate max-w-[150px]">{cat}</span>
                              <input
                                type="checkbox"
                                checked={config.active}
                                onChange={() => handleToggleCategoryActive(cat)}
                                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                              />
                            </div>

                            {config.active && (
                              <div className="space-y-2 pt-1 border-t border-slate-200/50">
                                {/* Year limits */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-slate-400 font-bold font-sans">Lahir Tahun:</span>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <input
                                      type="number"
                                      value={config.minYear || 2000}
                                      onChange={(e) => handleUpdateYearBounds(cat, "min", parseInt(e.target.value) || 2000)}
                                      className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center font-bold text-slate-800"
                                    />
                                    <span className="text-slate-400 font-bold">-</span>
                                    <input
                                      type="number"
                                      value={config.maxYear || 2024}
                                      onChange={(e) => handleUpdateYearBounds(cat, "max", parseInt(e.target.value) || 2024)}
                                      className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center font-bold text-slate-800"
                                    />
                                  </div>
                                </div>

                                {/* Custom/Bebas Input mode toggle */}
                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2 mb-2">
                                  <span className="text-[10px] text-slate-500 font-bold">✍️ Isian Bebas (Tanpa Kelas Baku)</span>
                                  <input
                                    type="checkbox"
                                    checked={config.isBebas}
                                    onChange={() => handleToggleCategoryBebas(cat)}
                                    className="w-3.5 h-3.5 accent-amber-600 rounded cursor-pointer"
                                  />
                                </div>

                                {/* Checklist of all available classes */}
                                {!config.isBebas && config.classes && config.classes.length > 0 && (
                                  <div className="space-y-1.5 pt-1.5">
                                    <span className="text-[10px] text-slate-500 font-extrabold block">Daftar Kelas Pilihan (Centang untuk Aktif):</span>
                                    <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                      {config.classes.map((cls, idx) => (
                                        <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors text-[10px] font-semibold text-slate-700">
                                          <input
                                            type="checkbox"
                                            checked={cls.active}
                                            onChange={() => {
                                              setLocalSettings(prev => {
                                                const updatedClassData = { ...prev.classData };
                                                updatedClassData[cat] = {
                                                  ...updatedClassData[cat],
                                                  classes: updatedClassData[cat].classes.map((item, iIndex) => 
                                                    iIndex === idx ? { ...item, active: !item.active } : item
                                                  )
                                                };
                                                return {
                                                  ...prev,
                                                  classData: updatedClassData
                                                };
                                              });
                                            }}
                                            className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                                          />
                                          <span className="truncate" title={cls.name}>{cls.name}</span>
                                        </label>
                                      ))}
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

              {/* DROPDOWN 2: KATEGORI PEMASALAN */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsPemasalanOpen(!isPemasalanOpen)}
                  className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200/80 transition-colors font-extrabold text-xs text-slate-800 uppercase text-left cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">🏅 Kategori Pemasalan</span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {isPemasalanOpen ? "▲ TUTUP" : "▼ KLIK UNTUK MEMBUKA"}
                  </span>
                </button>

                {isPemasalanOpen && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto animate-fadeIn">
                    {Object.keys(localSettings.classData)
                      .map((cat) => {
                        const config = localSettings.classData[cat];
                        return (
                          <div key={cat} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-left shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-800 text-xs truncate max-w-[150px]">{cat}</span>
                              <input
                                type="checkbox"
                                checked={config.active}
                                onChange={() => handleToggleCategoryActive(cat)}
                                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                              />
                            </div>

                            {config.active && (
                              <div className="space-y-2 pt-1 border-t border-slate-200/50">
                                {/* Year limits */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-slate-400 font-bold font-sans">Lahir Tahun:</span>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <input
                                      type="number"
                                      value={config.minYear || 2000}
                                      onChange={(e) => handleUpdateYearBounds(cat, "min", parseInt(e.target.value) || 2000)}
                                      className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center font-bold text-slate-800"
                                    />
                                    <span className="text-slate-400 font-bold">-</span>
                                    <input
                                      type="number"
                                      value={config.maxYear || 2024}
                                      onChange={(e) => handleUpdateYearBounds(cat, "max", parseInt(e.target.value) || 2024)}
                                      className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center font-bold text-slate-800"
                                    />
                                  </div>
                                </div>

                                {/* Custom/Bebas Input mode toggle */}
                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2 mb-2">
                                  <span className="text-[10px] text-slate-500 font-bold">✍️ Isian Bebas (Tanpa Kelas Baku)</span>
                                  <input
                                    type="checkbox"
                                    checked={config.isBebas}
                                    onChange={() => handleToggleCategoryBebas(cat)}
                                    className="w-3.5 h-3.5 accent-amber-600 rounded cursor-pointer"
                                  />
                                </div>

                                {/* Checklist of all available classes */}
                                {!config.isBebas && config.classes && config.classes.length > 0 && (
                                  <div className="space-y-1.5 pt-1.5">
                                    <span className="text-[10px] text-slate-500 font-extrabold block">Daftar Kelas Pilihan (Centang untuk Aktif):</span>
                                    <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                      {config.classes.map((cls, idx) => (
                                        <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors text-[10px] font-semibold text-slate-700">
                                          <input
                                            type="checkbox"
                                            checked={cls.active}
                                            onChange={() => {
                                              setLocalSettings(prev => {
                                                const updatedClassData = { ...prev.classData };
                                                updatedClassData[cat] = {
                                                  ...updatedClassData[cat],
                                                  classes: updatedClassData[cat].classes.map((item, iIndex) => 
                                                    iIndex === idx ? { ...item, active: !item.active } : item
                                                  )
                                                };
                                                return {
                                                  ...prev,
                                                  classData: updatedClassData
                                                };
                                              });
                                            }}
                                            className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                                          />
                                          <span className="truncate" title={cls.name}>{cls.name}</span>
                                        </label>
                                      ))}
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

            </div>
          )}
        </div>

      </div>

      {/* SOLID SAVE SETTINGS BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 border border-emerald-800 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-emerald-950/10">
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
            <span>💾</span> Simpan Perubahan Pengaturan Admin
          </h4>
          <p className="text-[10px] text-emerald-300 font-semibold mt-1">
            Tekan tombol simpan di samping untuk menerapkan seluruh konfigurasi sistem turnamen yang baru ke database.
          </p>
        </div>
        <button
          onClick={handleSaveChangesAll}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs px-7 py-3.5 rounded-2xl shadow-lg transition-all uppercase cursor-pointer shrink-0 border border-emerald-400/20 active:scale-95"
        >
          💾 SIMPAN PENGATURAN
        </button>
      </div>

      {/* DEBUG/TESTING AREA */}
      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 space-y-4">
        <h3 className="font-extrabold text-amber-800 text-sm uppercase tracking-tight flex items-center gap-2">
          <ShieldAlert size={18} className="text-amber-600" />
          Pengujian Bagan (Otomatis)
        </h3>
        <p className="text-xs text-amber-700 font-semibold leading-relaxed leading-normal">
          Klik tombol di bawah untuk membuat data 2-50 atlet dummy secara acak untuk SETIAP kelas aktif yang bukan kategori bebas. 
          Gunakan aksi ini hanya jika database Anda masih kosong atau saat menguji sistem bagan pertandingan!
        </p>
        <div className="flex flex-wrap gap-3.5">
          <button
            onClick={async () => {
              if (window.confirm("Apakah Anda yakin ingin menginjeksi ratusan/ribuan atlet palsu ke dalam sistem ini? Aksi ini akan mempengaruhi beban Firestore Anda.")) {
                try {
                  showToast("Memproses injeksi data atlet dummy ke Firestore... Harap tunggu.");
                  await generateDummyAthletes(localSettings, 2);
                  showToast("Berhasil memasukkan data atlet dummy ke seluruh kelas pertandingan!");
                } catch (e) {
                  console.error(e);
                  alert("Gagal menginjeksi data. Periksa konsol.");
                }
              }
            }}
            className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[10px] px-6 py-3.5 rounded-2xl transition-all shadow-md uppercase"
          >
            🧪 GENERATE DUMMY ATLET (2-50 / KELAS)
          </button>
        </div>
      </div>

      {/* DANGEROUS DISASTER ACTION AREA: ARCHIVE & RESET SYSTEM */}
      <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 space-y-4">
        <h3 className="font-extrabold text-rose-800 text-sm uppercase tracking-tight flex items-center gap-2">
          <ShieldAlert size={18} className="text-rose-600 animate-pulse" />
          Arsipkan & Meriset Turnamen Baru (Zona Bahaya)
        </h3>
        <p className="text-xs text-rose-700 font-semibold leading-relaxed leading-normal">
          Aksi ini akan mencadangkan, mengarsipkan seluruh rekapitulasi data pendaftaran atlet dan log aktivitas ke dalam file arsip lokal Anda secara instan, lalu membersihkan seluruh database peserta tanding agar sistem siap menerima turnamen silat baru.
        </p>

        <div className="flex flex-wrap gap-3.5">
          <button
            onClick={handleDownloadBackup}
            className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md uppercase"
          >
            💾 UNDUH BACKUP DATA
          </button>
          <button
            onClick={onResetSystem}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-rose-950/20 uppercase"
          >
            🚨 ARSIPKAN & BUAT TURNAMEN BARU
          </button>
        </div>
      </div>

      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-955 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-slideIn max-w-sm">
          <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
            <span>✓</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Sistem Pengaturan</p>
            <p className="text-xs font-bold text-slate-100 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {customConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-scaleUp text-left">
            <div className="flex items-center gap-3 text-emerald-600">
              <Settings size={24} />
              <h4 className="font-black text-slate-900 text-base uppercase tracking-tight">{customConfirm.title}</h4>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
              {customConfirm.message}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  customConfirm.onConfirm();
                  setCustomConfirm(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customConfirm.onCancel) customConfirm.onCancel();
                  setCustomConfirm(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
