import React, { useState } from "react";
import { 
  Key, Search, Edit3, Eye, EyeOff, Save, X, Phone, User, CheckCircle, ShieldAlert,
  AlertTriangle, RefreshCw, KeyRound, Lock, Info
} from "lucide-react";
import { Contingent } from "../types";

interface UserPasswordKontingenProps {
  contingents: Contingent[];
  onUpdateContingentDetails: (
    contingentId: string,
    updatedData: { pjName?: string; nowa?: string; passwordHash?: string }
  ) => void;
}

export default function UserPasswordKontingen({
  contingents,
  onUpdateContingentDetails
}: UserPasswordKontingenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingContingent, setEditingContingent] = useState<Contingent | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Form Edit states
  const [editPjName, setEditPjName] = useState("");
  const [editNowa, setEditNowa] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  
  // Double Verification Checkboxes for password change
  const [isCheckedVerify1, setIsCheckedVerify1] = useState(false);
  const [isCheckedVerify2, setIsCheckedVerify2] = useState(false);

  // Filter out admin users
  const contingentUsers = contingents.filter(c => c.role === "kontingen");

  const filteredContingents = contingentUsers.filter(c => 
    c.contingentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pjName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nowa.includes(searchTerm)
  );

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleStartEdit = (contingent: Contingent) => {
    setEditingContingent(contingent);
    setEditPjName(contingent.pjName);
    setEditNowa(contingent.nowa);
    setEditPassword(contingent.passwordHash);
    setEditPasswordConfirm(contingent.passwordHash);
    setIsCheckedVerify1(false);
    setIsCheckedVerify2(false);
  };

  const handleSaveDetails = () => {
    if (!editingContingent) return;

    if (!editPjName.trim() || !editNowa.trim()) {
      alert("Nama Penanggung Jawab dan nomor WA tidak boleh kosong!");
      return;
    }

    const payload: { pjName: string; nowa: string; passwordHash?: string } = {
      pjName: editPjName,
      nowa: editNowa
    };

    // If password was modified
    if (editPassword !== editingContingent.passwordHash) {
      if (editPassword.length < 4) {
        alert("Password baru minimal 4 karakter!");
        return;
      }

      if (editPassword !== editPasswordConfirm) {
        alert("Konfirmasi password tidak cocok!");
        return;
      }

      // 2x Verification check
      if (!isCheckedVerify1 || !isCheckedVerify2) {
        alert("Harap centang kedua verifikasi konfirmasi untuk melakukan pergantian password!");
        return;
      }

      payload.passwordHash = editPassword;
    }

    onUpdateContingentDetails(editingContingent.id, payload);
    alert(`Sukses memperbarui data login kontingen ${editingContingent.contingentName}!`);
    setEditingContingent(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="bg-emerald-500 p-3.5 rounded-2xl text-slate-900 shadow-lg shadow-emerald-500/20">
            <Key size={28} />
          </div>
          <div>
            <h2 className="font-black text-xl md:text-2xl tracking-tight uppercase">
              Akun & Password Login Kontingen
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Kelola kredensial login, penanggung jawab, serta kontak WhatsApp resmi dari tiap kontingen terdaftar.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH AND QUICK INFOCARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIST CONTINGENTS (7 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                Daftar Akun Kontingen ({filteredContingents.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kontingen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="py-3 px-4">Nama Kontingen</th>
                    <th className="py-3 px-4">Username Login</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">PJ Kontingen</th>
                    <th className="py-3 px-4">WhatsApp WA</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredContingents.length > 0 ? (
                    filteredContingents.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-900 uppercase">
                          {c.contingentName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">
                          {c.username}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <div className="flex items-center gap-1.5">
                            <span>
                              {showPasswords[c.id] ? c.passwordHash : "••••••••"}
                            </span>
                            <button
                              onClick={() => toggleShowPassword(c.id)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                            >
                              {showPasswords[c.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {c.pjName || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {c.nowa || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleStartEdit(c)}
                            className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-black px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wide transition-all"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        Tidak ada akun kontingen terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border border-blue-150 rounded-2xl p-4 flex items-start gap-3 text-xs leading-normal font-semibold text-blue-800">
              <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Informasi Privasi & Akun:</p>
                <p className="mt-0.5 opacity-90">
                  Secara default, kontingen mendaftar secara mandiri menggunakan kredensial di atas. Jika mereka lupa password atau data WA berubah, Anda dapat memperbarui datanya secara langsung dari panel ini.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE EDIT FORM WITH DOUBLE VERIFICATION (4 Cols) */}
        <div className="lg:col-span-4">
          {editingContingent ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Formulir Koreksi</span>
                  <h4 className="font-black text-slate-900 text-sm uppercase leading-tight">
                    {editingContingent.contingentName}
                  </h4>
                </div>
                <button
                  onClick={() => setEditingContingent(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* PJ Name input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Penanggung Jawab Kontingen
                </label>
                <input
                  type="text"
                  value={editPjName}
                  onChange={(e) => setEditPjName(e.target.value)}
                  placeholder="Nama Penanggung Jawab..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* WA number input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  No. WhatsApp (WA)
                </label>
                <input
                  type="text"
                  value={editNowa}
                  onChange={(e) => setEditNowa(e.target.value)}
                  placeholder="62xxxxxxxxxx..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Password inputs */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wide">
                  <KeyRound size={14} className="text-amber-500" />
                  Ganti Password Kontingen
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">Password Baru</label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={editPasswordConfirm}
                    onChange={(e) => setEditPasswordConfirm(e.target.value)}
                    placeholder="Ketik ulang password baru..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* DOUBLE VERIFICATION SECTION (Only shown if password was actually changed) */}
                {editPassword !== editingContingent.passwordHash && (
                  <div className="space-y-2.5 bg-amber-50/70 border border-amber-200 p-3 rounded-xl animate-in zoom-in-95 duration-150">
                    <div className="flex items-start gap-1.5 text-[10px] font-bold text-amber-800 leading-none mb-1">
                      <AlertTriangle size={12} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>PERSETUJUAN VERIFIKASI 2X:</span>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer text-[10px] font-semibold text-amber-900 leading-snug">
                      <input
                        type="checkbox"
                        checked={isCheckedVerify1}
                        onChange={(e) => setIsCheckedVerify1(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 mt-0.5 w-3.5 h-3.5"
                      />
                      <span>Saya sadar bahwa mengganti password akan memutus login kontingen ini di perangkat lain.</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-[10px] font-semibold text-amber-900 leading-snug">
                      <input
                        type="checkbox"
                        checked={isCheckedVerify2}
                        onChange={(e) => setIsCheckedVerify2(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 mt-0.5 w-3.5 h-3.5"
                      />
                      <span>Saya telah memastikan data password baru di atas sudah benar & dicatat jika perlu.</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDetails}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-950/20 uppercase tracking-wide flex items-center justify-center gap-1"
                >
                  <Save size={13} />
                  Simpan Perubahan
                </button>
                <button
                  onClick={() => setEditingContingent(null)}
                  className="bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs px-4 rounded-xl transition-all border border-slate-200"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400 space-y-2.5">
              <Lock className="mx-auto text-slate-300 animate-pulse" size={32} />
              <p className="text-xs font-bold text-slate-500">Koreksi Kredensial</p>
              <p className="text-[10px] text-slate-400">Silakan klik tombol "Edit" pada salah satu akun kontingen di sebelah kiri untuk mengoreksi data PJ, WA, atau Password login.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
