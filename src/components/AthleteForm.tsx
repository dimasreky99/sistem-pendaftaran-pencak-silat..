import React, { useState, useEffect } from "react";
import { SystemSettings, Athlete } from "../types";
import { User, ShieldCheck, Dumbbell, Paperclip, ChevronLeft, Calendar } from "lucide-react";

interface AthleteFormProps {
  initialAthlete?: Athlete | null;
  settings: SystemSettings;
  contingentName: string;
  athletes?: Athlete[];
  onSave: (athlete: Omit<Athlete, "id" | "isAcc"> & { id?: string }) => void;
  onCancel: () => void;
}

export default function AthleteForm({
  initialAthlete,
  settings,
  contingentName,
  athletes = [],
  onSave,
  onCancel
}: AthleteFormProps) {
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [jk, setJk] = useState<"Putra" | "Putri">("Putra");
  const [kategori, setKategori] = useState("");
  const [kelas, setKelas] = useState("");
  const [nowa, setNowa] = useState("");
  const [customData, setCustomData] = useState<string[]>([]);
  const [fotos, setFotos] = useState<string[]>([]);
  const [matchType, setMatchType] = useState<"Prestasi" | "Pemasalan">("Prestasi");
  
  const [loading, setLoading] = useState(false);
  const [nikError, setNikError] = useState("");

  // Initialize form for Editing or New
  useEffect(() => {
    if (initialAthlete) {
      setName(initialAthlete.name);
      setNik(initialAthlete.nik);
      setTglLahir(initialAthlete.tglLahir);
      setJk(initialAthlete.jk);
      setKategori(initialAthlete.kategori);
      setNowa(initialAthlete.nowa);
      setCustomData(initialAthlete.customData || Array(settings.customFields.length).fill(""));
      setFotos(initialAthlete.fotos || Array(settings.photoLabels.length).fill(""));

      // Parse complex class string: "Prestasi | Kelas A (39 kg - 43 kg)"
      let fullClass = initialAthlete.kelas;
      
      // Extract Match Type (Prestasi or Pemasalan)
      if (fullClass.startsWith("Pemasalan | ")) {
        setMatchType("Pemasalan");
        fullClass = fullClass.substring(12);
      } else {
        setMatchType("Prestasi");
        if (fullClass.startsWith("Prestasi | ")) {
          fullClass = fullClass.substring(11);
        }
      }

      // Strip physical stats suffix if any historically exists in database
      fullClass = fullClass.replace(/\s*\(Usia:.*?\)/, "").trim();
      
      setKelas(fullClass);
    } else {
      setName("");
      setNik("");
      setTglLahir("");
      setJk("Putra");
      setKategori("");
      setKelas("");
      setNowa("");
      setCustomData(Array(settings.customFields.length).fill(""));
      setFotos(Array(settings.photoLabels.length).fill(""));
    }
  }, [initialAthlete, settings]);

  // NIK automatic parser
  const handleNikChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "").substring(0, 16);
    setNik(cleaned);
    setNikError("");

    if (cleaned.length === 16) {
      // DD MM YY representation
      let dd = parseInt(cleaned.substring(6, 8), 10);
      const mm = parseInt(cleaned.substring(8, 10), 10);
      const yy = parseInt(cleaned.substring(10, 12), 10);
      let calculatedJk: "Putra" | "Putri" = "Putra";

      // NIK rule: For female, day is added by 40
      if (dd > 40) {
        dd -= 40;
        calculatedJk = "Putri";
      }

      // Validate date bounds
      if (dd < 1 || dd > 31 || mm < 1 || mm > 12) {
        setNikError("Format tanggal lahir pada NIK tidak valid.");
        return;
      }

      // Resolve birth year (e.g. 26 in 2026 as benchmark)
      const currentYearBenchmark = 26; // Year 2026
      const fullYear = yy > currentYearBenchmark ? 1900 + yy : 2000 + yy;
      
      // Date of birth
      const dobStr = `${fullYear}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
      
      // Calculate age based on 2026-05-10 (standard tournament date benchmark in GAS code)
      const benchmarkDate = new Date("2026-05-10");
      const birthDate = new Date(fullYear, mm - 1, dd);
      let age = benchmarkDate.getFullYear() - birthDate.getFullYear();
      const m = benchmarkDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && benchmarkDate.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 0 || age > 100 || isNaN(age)) {
        setNikError("Tahun lahir tidak realistis.");
        return;
      }

      // Auto assign Category based on Year ranges defined in settings
      let matchedCategory = "";
      Object.keys(settings.classData).forEach(cat => {
        const conf = settings.classData[cat];
        if (conf.active && conf.minYear && conf.maxYear) {
          if (fullYear >= conf.minYear && fullYear <= conf.maxYear) {
            matchedCategory = cat;
          }
        }
      });

      // Standard fallback categorization if configs are missing
      if (!matchedCategory) {
        if (age <= 5) matchedCategory = "Pra Usia Dini";
        else if (age <= 8) matchedCategory = "Usia Dini 1";
        else if (age <= 11) matchedCategory = "Usia Dini 2";
        else if (age <= 14) matchedCategory = "Pra Remaja";
        else if (age <= 17) matchedCategory = "Remaja";
        else if (age <= 35) matchedCategory = "Dewasa";
        else if (age <= 45) matchedCategory = "Master 1";
        else matchedCategory = "Master 2";
      }

      // Apply changes
      setTglLahir(dobStr);
      setJk(calculatedJk);
      setKategori(matchedCategory);
      setKelas(""); // Reset class for category

      // Trigger standard sweetalert / native notification
      alert(`NIK VALID!\nLahir: ${dd}/${mm}/${fullYear} (${age} tahun)\nGender: ${calculatedJk}\nKategori: ${matchedCategory}`);
    }
  };

  // Process File Uploads (Resize & Compress to Base64 to save storage)
  const handleFileUpload = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Format berkas wajib gambar murni (JPG, JPEG, PNG)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxW = 600;
          const maxH = 600;
          let w = img.width;
          let h = img.height;

          if (w > maxW) {
            h *= maxW / w;
            w = maxW;
          }
          if (h > maxH) {
            w *= maxH / h;
            h = maxH;
          }

          canvas.width = w;
          canvas.height = h;
          ctx?.drawImage(img, 0, 0, w, h);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);
          const updatedFotos = [...fotos];
          updatedFotos[index] = compressedBase64;
          setFotos(updatedFotos);
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomFieldChange = (index: number, val: string) => {
    const updated = [...customData];
    updated[index] = val;
    setCustomData(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (nik.length !== 16) {
      alert("Format NIK harus berupa 16 digit angka murni!");
      return;
    }

    if (!kelas) {
      alert("Silakan pilih kelas tanding atau seni!");
      return;
    }

    // Validate custom fields
    for (let i = 0; i < settings.customFields.length; i++) {
      if (!customData[i] || customData[i].trim() === "") {
        alert(`Kolom "${settings.customFields[i]}" wajib diisi!`);
        return;
      }
    }

    // Validate photo uploads
    for (let i = 0; i < settings.photoLabels.length; i++) {
      if (!fotos[i]) {
        alert(`Berkas "${settings.photoLabels[i]}" wajib diupload!`);
        return;
      }
    }

    // Prestasi limits check on submit
    if (matchType === "Prestasi") {
      const registeredCount = (athletes || []).filter(a => {
        if (initialAthlete && a.id === initialAthlete.id) return false;
        if (a.kontingen !== contingentName) return false;
        const isPrestasi = a.kelas.startsWith("Prestasi | ");
        const athleteClass = isPrestasi ? a.kelas.substring(11) : a.kelas;
        return isPrestasi && athleteClass === kelas && a.jk === jk && a.kategori === kategori;
      }).length;

      let limit = 1;
      if (kelas.toLowerCase().includes("ganda")) {
        limit = 2;
      } else if (kelas.toLowerCase().includes("regu") || kelas.toLowerCase().includes("beregu")) {
        limit = 3;
      }

      if (registeredCount >= limit) {
        alert(`Pendaftaran Gagal: Kontingen Anda sudah memenuhi kuota (${limit} orang) untuk kelas "${kelas}" di kategori Prestasi!`);
        return;
      }
    }

    // Add match type prefix
    const prefixedClass = `${matchType} | ${kelas}`;

    setLoading(true);

    onSave({
      id: initialAthlete?.id,
      name: name.toUpperCase(),
      nik,
      tglLahir,
      jk,
      kategori,
      kelas: prefixedClass,
      kontingen: initialAthlete ? initialAthlete.kontingen : contingentName,
      nowa,
      customData,
      fotos,
      revisiCatatan: undefined // clear warning on resubmit
    });
  };

  // Filter available classes based on chosen category & gender
  const getAvailableClasses = () => {
    if (!kategori || !settings.classData[kategori]) return [];
    const catConf = settings.classData[kategori];
    if (catConf.isBebas) return []; // free input text is handled dynamically
    
    return catConf.classes.filter(c => {
      if (!c.active) return false;
      if (jk === "Putra" && !c.pa) return false;
      if (jk === "Putri" && !c.pi) return false;

      // Prestasi quota constraint
      if (matchType === "Prestasi") {
        const registeredCount = (athletes || []).filter(a => {
          if (initialAthlete && a.id === initialAthlete.id) return false;
          if (a.kontingen !== contingentName) return false;
          const isPrestasi = a.kelas.startsWith("Prestasi | ");
          const athleteClass = isPrestasi ? a.kelas.substring(11) : a.kelas;
          return isPrestasi && athleteClass === c.name && a.jk === jk && a.kategori === kategori;
        }).length;

        let limit = 1;
        if (c.name.toLowerCase().includes("ganda")) {
          limit = 2;
        } else if (c.name.toLowerCase().includes("regu") || c.name.toLowerCase().includes("beregu")) {
          limit = 3;
        }

        if (registeredCount >= limit) return false;
      }

      return true;
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-2xl mx-auto shadow-sm border border-slate-100">
      {/* Form Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-6">
        <button
          onClick={onCancel}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-none uppercase">
            {initialAthlete ? "Edit Data Atlet" : "Pendaftaran Atlet Baru"}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            {initialAthlete ? `Mengubah berkas atlet ${initialAthlete.name}` : `Kontingen: ${contingentName}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <User size={16} className="text-emerald-600" />
            Informasi Pribadi Atlet
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NIK Input */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {settings.standardFieldLabels?.nik || "NIK (Nomor Induk Kependudukan)"} <span className="text-red-500 font-extrabold">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => handleNikChange(e.target.value)}
                placeholder="Masukkan 16 digit NIK..."
                className={`w-full px-4 py-3 bg-white border rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 ${
                  nikError 
                    ? "border-rose-400 focus:ring-rose-200" 
                    : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                }`}
              />
              {nikError && (
                <p className="text-[10px] font-bold text-rose-600 mt-1">{nikError}</p>
              )}
              <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-normal">
                * Sistem akan mengurai NIK secara biologis untuk mengisi otomatis Tanggal Lahir, Gender, dan Kategori Kelas IPSI.
              </p>
            </div>

            {/* Nama Atlet */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {settings.standardFieldLabels?.namaLengkap || "Nama Lengkap Sesuai KTP/Akte"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="Masukkan nama lengkap..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Tanggal Lahir (Disabled, filled via NIK) */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                <Calendar size={13} /> {settings.standardFieldLabels?.tglLahir || "Tanggal Lahir (Otomatis)"}
              </label>
              <input
                type="date"
                disabled
                value={tglLahir}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* No WhatsApp Atlet */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {settings.standardFieldLabels?.nowa || "No. WhatsApp Atlet/Wali"}
              </label>
              <input
                type="text"
                required
                value={nowa}
                onChange={(e) => setNowa(e.target.value)}
                placeholder="Contoh: 0812345678"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CLASS DETAILS */}
        <div className="bg-blue-50/20 rounded-2xl p-5 border border-blue-100/40 space-y-4">
          <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2 border-b border-blue-100/50 pb-2.5">
            <Dumbbell size={16} className="text-blue-700" />
            Detail Pertandingan Silat
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jenis Pertandingan */}
            <div>
              <label className="text-xs font-bold text-blue-800 block mb-1.5">Skema Tanding</label>
              <select
                value={matchType}
                onChange={(e) => {
                  setMatchType(e.target.value as any);
                  setKelas("");
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {settings.matchType !== "Pemasalan" && <option value="Prestasi">🏆 Prestasi</option>}
                {settings.matchType !== "Prestasi" && <option value="Pemasalan">🏅 Pemasalan (Pemasalan/Dini)</option>}
              </select>
            </div>

            {/* Jenis Kelamin (Otomatis NIK) */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">
                {settings.standardFieldLabels?.jk || "Jenis Kelamin (Otomatis)"}
              </label>
              <select
                disabled
                value={jk}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-sm text-slate-500 cursor-not-allowed"
              >
                <option value="Putra">Putra</option>
                <option value="Putri">Putri</option>
              </select>
            </div>

            {/* Kategori Usia (Otomatis NIK) */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 block mb-1.5">Kategori Usia (Otomatis)</label>
              <input
                type="text"
                disabled
                value={kategori || "Masukkan NIK terlebih dahulu untuk memetakan kategori"}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm text-emerald-800 cursor-not-allowed"
              />
            </div>

            {/* Pilih Kelas */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-blue-800 block mb-1.5">Pilih Kelas Pertandingan</label>
              {kategori && settings.classData[kategori]?.isBebas ? (
                <input
                  type="text"
                  required
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Ketik Kelas Pertandingan..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              ) : (
                <select
                  required
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  disabled={!kategori}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {getAvailableClasses().map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: CUSTOM FIELDS */}
        {settings.customFields.length > 0 && (
          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <ShieldCheck size={16} className="text-slate-600" />
              Persyaratan Tambahan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.customFields.map((field, idx) => (
                <div key={idx}>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">{field}</label>
                  <input
                    type="text"
                    required
                    value={customData[idx] || ""}
                    onChange={(e) => handleCustomFieldChange(idx, e.target.value)}
                    placeholder={`Masukkan ${field}...`}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: FILE UPLOADS */}
        {settings.photoLabels.length > 0 && (
          <div className="bg-amber-50/25 rounded-2xl p-5 border border-amber-100 space-y-4">
            <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2 border-b border-amber-100/50 pb-2.5">
              <Paperclip size={16} className="text-amber-700" />
              Upload Berkas Digital
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.photoLabels.map((label, idx) => {
                const hasFile = !!fotos[idx];
                return (
                  <div key={idx} className="space-y-2">
                    <label className="text-xs font-bold text-amber-900 block">{label}</label>
                    <div className="flex items-center gap-3">
                      {/* Upload Button */}
                      <div className="relative overflow-hidden inline-block shrink-0">
                        <button
                          type="button"
                          className="bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          {hasFile ? "🔄 Ganti File" : "📎 Pilih File"}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          required={!hasFile}
                          capture="environment"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(idx, e.target.files[0]);
                            }
                          }}
                          className="absolute left-0 top-0 opacity-0 scale-150 cursor-pointer w-full h-full"
                        />
                      </div>

                      {/* File Preview */}
                      {hasFile ? (
                        <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                          <img src={fotos[idx]} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">Belum ada file terupload</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-extrabold text-sm py-4 rounded-2xl transition-all shadow-xl shadow-emerald-950/20 text-center cursor-pointer disabled:opacity-50"
          >
            {loading ? "PROSES MENYIMPAN..." : "💾 SIMPAN DATA ATLET"}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all border border-slate-200 text-center"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
