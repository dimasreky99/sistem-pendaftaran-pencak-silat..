import React, { useState } from "react";
import { User, ShieldCheck, Camera, Shield, Phone, Key, Lock, Save } from "lucide-react";
import { Contingent } from "../types";

interface UserProfileProps {
  currentUser: Contingent;
  onUpdateProfile: (data: any) => void;
  onUpdatePassword: (oldPw: string, newPw: string) => void;
}

export default function UserProfile({ currentUser, onUpdateProfile, onUpdatePassword }: UserProfileProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [pjName, setPjName] = useState(currentUser.pjName || "");
  const [nowa, setNowa] = useState(currentUser.nowa || "");
  const [photoUrl, setPhotoUrl] = useState(currentUser.photoUrl || "");
  
  const [managerPhotoUrl, setManagerPhotoUrl] = useState(currentUser.managerPhotoUrl || "");
  const [official1Name, setOfficial1Name] = useState(currentUser.official1Name || "");
  const [official1PhotoUrl, setOfficial1PhotoUrl] = useState(currentUser.official1PhotoUrl || "");
  const [official2Name, setOfficial2Name] = useState(currentUser.official2Name || "");
  const [official2PhotoUrl, setOfficial2PhotoUrl] = useState(currentUser.official2PhotoUrl || "");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok!");
      return;
    }
    if(onUpdatePassword) onUpdatePassword(oldPassword, newPassword);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pjName.trim()) {
      alert("Nama admin / penanggung jawab tidak boleh kosong!");
      return;
    }
    onUpdateProfile({ 
      pjName, 
      nowa, 
      photoUrl,
      managerPhotoUrl,
      official1Name,
      official1PhotoUrl,
      official2Name,
      official2PhotoUrl
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
        <div className="bg-slate-900 p-2.5 rounded-xl text-white">
          <User size={22} />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-none uppercase">
            Data Profil
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Informasi data profil, foto admin, nomor HP, dan keamanan kata sandi akun.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Bento Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck size={16} className="text-emerald-600" />
            Pengaturan Data Profil
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-white shadow-inner flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-slate-400 uppercase">
                      {(pjName || currentUser.username).substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="profilePhotoUpload"
                  className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shadow-md transition-all border border-white"
                  title="Ganti Foto"
                >
                  <Camera size={14} />
                  <input
                    type="file"
                    id="profilePhotoUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, setPhotoUrl)}
                  />
                </label>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Hak Akses</div>
                <div className="font-extrabold text-slate-900 text-xs flex items-center justify-center gap-1 mt-0.5">
                  <Shield size={12} className="text-emerald-600" />
                  {currentUser.role === "admin" ? "MASTER PANITIA" : "OFFICIAL KONTINGEN"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Username Akun (Kredensial)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.username}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              {currentUser.role !== "admin" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nama Kontingen</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.contingentName}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  {currentUser.role === "admin" ? "Nama Admin Utama" : "Nama Penanggung Jawab (PJ)"}
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={pjName}
                    onChange={(e) => setPjName(e.target.value)}
                    placeholder="Masukkan nama PJ / Admin..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nomor WhatsApp PJ / Kontak HP</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={nowa}
                    onChange={(e) => setNowa(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {currentUser.role !== "admin" && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Data ID Card Official Kontingen</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mb-3">Lengkapi foto Manager & Official untuk dicetak di ID Card.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Foto Manager / PJ</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 bg-white">
                        {managerPhotoUrl ? (
                          <img src={managerPhotoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20}/></div>
                        )}
                      </div>
                      <label className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                        Upload Foto
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, setManagerPhotoUrl)} />
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Nama Official 1</label>
                      <input type="text" value={official1Name} onChange={(e) => setOfficial1Name(e.target.value)} placeholder="Nama Lengkap Official 1" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Foto Official 1</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 bg-white">
                          {official1PhotoUrl ? (
                            <img src={official1PhotoUrl} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20}/></div>
                          )}
                        </div>
                        <label className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                          Upload Foto
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, setOfficial1PhotoUrl)} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Nama Official 2</label>
                      <input type="text" value={official2Name} onChange={(e) => setOfficial2Name(e.target.value)} placeholder="Nama Lengkap Official 2" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Foto Official 2</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 bg-white">
                          {official2PhotoUrl ? (
                            <img src={official2PhotoUrl} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20}/></div>
                          )}
                        </div>
                        <label className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                          Upload Foto
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, setOfficial2PhotoUrl)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer mt-4"
              >
                <Save size={14} /> Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Bento */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock size={16} className="text-emerald-600" />
            Ganti Password Akun
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Password Lama</label>
              <div className="relative">
                <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Ketik password saat ini..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Password Baru</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/10 uppercase tracking-wider mt-4"
            >
              Simpan Password Baru
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 animate-bounce no-print z-50">
          <ShieldCheck size={18} />
          Data berhasil disimpan
        </div>
      )}
    </div>
  );
}
