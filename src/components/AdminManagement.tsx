import React, { useState, useMemo } from "react";
import { 
  User, Key, Plus, Trash2, Shield, Eye, EyeOff, Search, Info, Phone, Save, X, Edit3, CheckCircle2
} from "lucide-react";
import { Contingent } from "../types";

interface AdminManagementProps {
  contingents: Contingent[];
  onAddSubAdmin: (username: string, pass: string, pjName: string, nowa: string) => void;
  onDeleteContingent: (id: string) => void;
  onUpdateContingentPassword: (id: string, newPass: string) => void;
  onAddSystemLog: (actor: string, activity: string, detail: string) => void;
}

export default function AdminManagement({
  contingents,
  onAddSubAdmin,
  onDeleteContingent,
  onUpdateContingentPassword,
  onAddSystemLog
}: AdminManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubUser, setNewSubUser] = useState("");
  const [newSubPass, setNewSubPass] = useState("");
  const [newSubPjName, setNewSubPjName] = useState("");
  const [newSubNowa, setNewSubNowa] = useState("");
  const [showSubPass, setShowSubPass] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<string | null>(null);
  const [newPassInput, setNewPassInput] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Derived sub-admins list (role === "admin" but not master admin DIM)
  const subAdmins = useMemo(() => {
    return contingents.filter(c => c.role === "admin");
  }, [contingents]);

  const filteredSubAdmins = useMemo(() => {
    return subAdmins.filter(sub => 
      sub.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.pjName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.nowa.includes(searchTerm)
    );
  }, [subAdmins, searchTerm]);

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubUser.trim() || !newSubPass.trim() || !newSubPjName.trim() || !newSubNowa.trim()) {
      alert("Harap lengkapi seluruh isian sub-admin!");
      return;
    }

    // Check if duplicate username
    const usernameExists = contingents.some(
      c => c.username.toLowerCase() === newSubUser.trim().toLowerCase()
    );
    if (usernameExists) {
      alert("Username sudah digunakan oleh kontingen atau admin lain!");
      return;
    }

    onAddSubAdmin(
      newSubUser.trim(),
      newSubPass.trim(),
      newSubPjName.trim(),
      newSubNowa.trim()
    );

    onAddSystemLog(
      "SUPER ADMIN (DIM)",
      "Buat Sub-Admin",
      `Membuat akun sub-admin baru dengan username: ${newSubUser.trim()}`
    );

    // Reset Form
    setNewSubUser("");
    setNewSubPass("");
    setNewSubPjName("");
    setNewSubNowa("");
    alert("Akun Sub-Admin baru berhasil dibuat!");
  };

  const handleDeleteSub = (id: string, username: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akses sub-admin '${username}'?`)) {
      onDeleteContingent(id);
      onAddSystemLog(
        "SUPER ADMIN (DIM)",
        "Hapus Sub-Admin",
        `Menghapus akun sub-admin: ${username}`
      );
      alert(`Akun Sub-Admin '${username}' berhasil dihapus.`);
    }
  };

  const handleUpdatePassword = (id: string, username: string) => {
    if (!newPassInput.trim() || newPassInput.length < 4) {
      alert("Harap masukkan password baru minimal 4 karakter!");
      return;
    }

    onUpdateContingentPassword(id, newPassInput.trim());
    onAddSystemLog(
      "SUPER ADMIN (DIM)",
      "Ganti Password Sub-Admin",
      `Mengubah kata sandi untuk akun sub-admin: ${username}`
    );

    alert(`Sandi sub-admin '${username}' berhasil diubah!`);
    setSelectedSubAdmin(null);
    setNewPassInput("");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* HEADER BAR */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="bg-emerald-500 p-3.5 rounded-2xl text-slate-900 shadow-lg shadow-emerald-500/20">
            <User size={28} />
          </div>
          <div>
            <h2 className="font-black text-xl md:text-2xl tracking-tight uppercase">
              Kelola & Tambah Akun Admin / Panitia
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Delegasikan hak akses terbatas kepada rekan panitia pelaksana/sekretariat silat secara resmi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: CREATE NEW SUB-ADMIN (5 columns) */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCreateSub} className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-950 text-sm uppercase flex items-center gap-2">
                <Plus size={18} className="text-emerald-500" />
                Tambah Admin / Panitia Baru
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1">Buat kredensial login panitia secara lengkap.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: panitia_satu"
                    value={newSubUser}
                    onChange={(e) => setNewSubUser(e.target.value.replace(/\s+/g, "").toLowerCase())}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showSubPass ? "text" : "password"}
                      required
                      placeholder="Sandi kuat..."
                      value={newSubPass}
                      onChange={(e) => setNewSubPass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-3 pr-8 py-2.5 text-xs font-bold focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSubPass(!showSubPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSubPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide">Nama Penanggung Jawab / Panitia</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap rekan panitia..."
                  value={newSubPjName}
                  onChange={(e) => setNewSubPjName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide">No. WhatsApp Aktif</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0812XXXXXXXX atau 62812..."
                  value={newSubNowa}
                  onChange={(e) => setNewSubNowa(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-slate-950/20 uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                Daftarkan Akses Panitia
              </button>
            </div>
          </form>

          <div className="bg-blue-50 border border-blue-150 rounded-3xl p-5 mt-6 flex items-start gap-3.5 text-xs leading-normal font-semibold text-blue-800">
            <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wide text-[10px]">Tingkatan Hak Akses:</p>
              <p className="mt-1 text-blue-700 font-medium">
                Sub-Admin memiliki hak akses mengelola data seluruh peserta, melakukan timbang badan, membuat bagan pertandingan (brackets), mencetak ID card, serta rekap juara. Sub-Admin tidak dapat melihat data Security Logs Monitor atau mendaftarkan sub-admin lain.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIST SUB-ADMINS (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-950 text-sm uppercase">
                Daftar Akun Admin Aktif ({subAdmins.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            {filteredSubAdmins.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium text-xs border-2 border-dashed border-slate-200 rounded-2xl">
                Tidak ada sub-admin aktif yang ditemukan.
              </div>
            ) : (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Nama Panitia</th>
                      <th className="py-3 px-4">WhatsApp</th>
                      <th className="py-3 px-4">Kata Sandi</th>
                      <th className="py-3 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {filteredSubAdmins.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-900 uppercase flex items-center gap-2">
                          {sub.username}
                          {sub.username === "DIM" && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wide">
                              MASTER
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {sub.pjName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-600">
                          <span className="flex items-center gap-1">
                            <Phone size={10} /> {sub.nowa}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span>
                              {showPasswords[sub.id] ? sub.passwordHash : "••••••••"}
                            </span>
                            <button
                              onClick={() => toggleShowPassword(sub.id)}
                              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            >
                              {showPasswords[sub.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedSubAdmin(selectedSubAdmin === sub.id ? null : sub.id);
                                setNewPassInput("");
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold text-[9px] uppercase tracking-wide transition-all"
                            >
                              Sandi
                            </button>
                            {sub.username !== "DIM" && (
                              <button
                                onClick={() => handleDeleteSub(sub.id, sub.username)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedSubAdmin && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 uppercase">
                    <Key size={14} className="text-amber-500" />
                    Ganti Sandi Sub Admin: {subAdmins.find(s => s.id === selectedSubAdmin)?.username}
                  </div>
                  <button onClick={() => setSelectedSubAdmin(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik password baru..."
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-250 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-slate-900"
                  />
                  <button
                    onClick={() => {
                      const found = subAdmins.find(s => s.id === selectedSubAdmin);
                      if (found) {
                        handleUpdatePassword(found.id, found.username);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 rounded-xl transition-all shadow-sm"
                  >
                    Simpan Sandi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
