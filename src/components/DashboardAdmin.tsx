import React, { useState } from "react";
import { 
  Users, Landmark, ShieldCheck, UserCheck, Search, MessageCircle, FileText, CheckCircle, XCircle, Info, RefreshCw, Plus
} from "lucide-react";
import { Athlete, Contingent, SystemSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DashboardAdminProps {
  contingents: Contingent[];
  athletes: Athlete[];
  settings: SystemSettings;
  onUpdatePayment: (contingentName: string, status: "Lunas" | "Belum Lunas") => void;
  onToggleAcc: (athleteId: string) => void;
  onRejectAthlete: (athleteId: string, notes: string) => void;
  onDeleteAthlete: (athleteId: string) => void;
  onSelectAthleteForDetail: (athlete: Athlete) => void;
  onViewOfficialId: (pjName: string, contingent: string) => void;
  onAccAll: () => void;
  onTriggerRefresh: () => void;
  onAddContingent?: (c: Contingent) => void;
  onAddAthleteForContingent?: (contingentName: string) => void;
  onDeleteContingent?: (contingentName: string) => void;
  onNavigateToPayment?: () => void;
  onNavigateToAthletes?: () => void;
}

export default function DashboardAdmin({
  contingents,
  athletes,
  settings,
  onUpdatePayment,
  onToggleAcc,
  onRejectAthlete,
  onDeleteAthlete,
  onSelectAthleteForDetail,
  onViewOfficialId,
  onAccAll,
  onTriggerRefresh,
  onAddContingent,
  onAddAthleteForContingent,
  onDeleteContingent,
  onNavigateToPayment,
  onNavigateToAthletes
}: DashboardAdminProps) {
  const [searchKonti, setSearchKonti] = useState("");
  const [selectedContingent, setSelectedContingent] = useState<string | null>(null);
  const [viewingUnconfirmed, setViewingUnconfirmed] = useState(false);

  // States for Quick Add "+" workflow
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isDirectRegOpen, setIsDirectRegOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // States for safe inline Refresh/Reset confirmation
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct Contingent Registration form fields
  const [newPjName, setNewPjName] = useState("");
  const [newNowa, setNewNowa] = useState("");
  const [newContingentName, setNewContingentName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleCopyRegLink = () => {
    const regUrl = `${window.location.origin}/?register=true`;
    navigator.clipboard.writeText(regUrl).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 4000);
    }).catch(() => {
      // fallback
      const dummy = document.createElement("input");
      document.body.appendChild(dummy);
      dummy.value = regUrl;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 4000);
    });
  };

  const handleDirectRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPjName || !newNowa || !newContingentName || !newUsername || !newPassword) {
      alert("Harap semua kolom diisi!");
      return;
    }

    const existsUser = contingents.some(c => c.username.toLowerCase() === newUsername.toLowerCase());
    const existsKonti = contingents.some(c => c.contingentName.toLowerCase() === newContingentName.toLowerCase());
    if (existsUser) {
      alert("Username ini sudah digunakan, silakan pilih username lain!");
      return;
    }
    if (existsKonti) {
      alert("Nama kontingen ini sudah terdaftar!");
      return;
    }

    const uniqueCode = Math.floor(100 + Math.random() * 899);

    const newConti: Contingent = {
      id: "conti_" + Date.now(),
      pjName: newPjName,
      nowa: newNowa,
      contingentName: newContingentName,
      username: newUsername,
      passwordHash: newPassword,
      role: "kontingen",
      paymentStatus: "Belum Lunas",
      buktiTransferUrl: "",
      kodeUnik: uniqueCode
    };

    if (onAddContingent) {
      onAddContingent(newConti);
      // Reset fields
      setNewPjName("");
      setNewNowa("");
      setNewContingentName("");
      setNewUsername("");
      setNewPassword("");
      setIsDirectRegOpen(false);
    }
  };

  // Statistics calculation
  const totalAthletes = athletes.length;
  const totalContingents = contingents.filter(c => c.role === "kontingen").length;
  
  const unpaidContingents = contingents.filter(
    c => c.role === "kontingen" && c.paymentStatus === "Belum Lunas"
  ).length;

  const pendingAccCount = athletes.filter(a => !a.isAcc).length;

  // Map contingent to number of athletes
  const athleteCounts: Record<string, number> = {};
  athletes.forEach(a => {
    athleteCounts[a.kontingen] = (athleteCounts[a.kontingen] || 0) + 1;
  });

  const handleWAUrl = (nowa: string) => {
    let cleaned = nowa.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  const filteredContingents = contingents
    .filter(c => c.role === "kontingen")
    .filter(c => 
      c.contingentName.toLowerCase().includes(searchKonti.toLowerCase()) ||
      c.pjName.toLowerCase().includes(searchKonti.toLowerCase())
    );

  const getFilteredAthletesOfContingent = (name: string) => {
    return athletes.filter(a => a.kontingen === name);
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Atlet with Quick Add Plus button */}
        <motion.div 
          onClick={() => onNavigateToAthletes && onNavigateToAthletes()}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center justify-between gap-4 shadow-sm relative overflow-visible cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-4">
            {/* Quick action button + */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContingent(null);
                  setViewingUnconfirmed(false);
                  const section = document.getElementById("rekap-kontingen-section");
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition-all shadow-md cursor-pointer flex items-center justify-center border border-emerald-500/20 active:scale-95 shrink-0"
                title="Menuju ke Daftar Kontingen"
              >
                <Plus size={20} className="transition-transform duration-200" />
              </button>
            </div>

            <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-900/30 text-emerald-400">
              <Users size={24} />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Atlet</span>
              <b className="text-2xl lg:text-3xl font-extrabold tracking-tight">{totalAthletes}</b>
            </div>
          </div>
        </motion.div>

        {/* Total Kontingen */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center gap-4 shadow-sm"
        >
          <div className="bg-sky-950/50 p-3 rounded-xl border border-sky-900/30 text-sky-400">
            <Landmark size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Kontingen</span>
            <b className="text-2xl lg:text-3xl font-extrabold tracking-tight">{totalContingents}</b>
          </div>
        </motion.div>

        {/* Belum Lunas */}
        {!settings.isFree && (
          <motion.div 
            onClick={() => onNavigateToPayment && onNavigateToPayment()}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center gap-4 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <div className="bg-amber-950/50 p-3 rounded-xl border border-amber-900/30 text-amber-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Belum Lunas</span>
              <b className="text-2xl lg:text-3xl font-extrabold tracking-tight">{unpaidContingents}</b>
            </div>
          </motion.div>
        )}

        {/* Belum ACC */}
        <motion.div 
          onClick={() => {
            setViewingUnconfirmed(!viewingUnconfirmed);
            setSelectedContingent(null);
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`border rounded-2xl p-5 text-white flex items-center gap-4 shadow-sm cursor-pointer transition-all active:scale-95 ${
            viewingUnconfirmed 
              ? "bg-amber-950 border-amber-500 ring-2 ring-amber-500/30" 
              : "bg-slate-900 border-slate-800 hover:bg-slate-850"
          }`}
          title="Klik untuk menampilkan atlet belum di-ACC"
        >
          <div className="bg-rose-950/50 p-3 rounded-xl border border-rose-900/30 text-rose-400">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Belum ACC</span>
            <b className="text-2xl lg:text-3xl font-extrabold tracking-tight">{pendingAccCount}</b>
          </div>
        </motion.div>
      </div>

      {/* Action panel - Refresh */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between relative">
        {toastMessage && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 border border-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-xl flex items-center gap-1.5 whitespace-nowrap">
            <span>✅</span> {toastMessage}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse"></span>
          <span className="text-slate-300 text-sm font-semibold">Tindakan Sistem:</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (!isConfirmingReset) {
                setIsConfirmingReset(true);
                setTimeout(() => {
                  setIsConfirmingReset(false);
                }, 4000);
              } else {
                setIsConfirmingReset(false);
                onTriggerRefresh();
                setToastMessage("Data berhasil dimuat ulang.");
                setTimeout(() => {
                  setToastMessage(null);
                }, 5000);
              }
            }}
            className={`font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              isConfirmingReset 
                ? "bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-500 animate-pulse" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            <RefreshCw size={14} className={isConfirmingReset ? "animate-spin" : ""} /> 
            {isConfirmingReset ? "👉 KLIK LAGI UNTUK KONFIRMASI RESET DATA!" : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Main View Grid */}
      <div className="space-y-6">
        {selectedContingent === null ? (
          viewingUnconfirmed ? (
            /* TABLE: ATLET BELUM ACC */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-none uppercase">
                    Daftar Atlet Belum di-ACC
                  </h3>
                  <p className="text-xs text-rose-500 mt-1.5 font-semibold">Total: {athletes.filter(a => !a.isAcc).length} Atlet Menunggu Audit</p>
                </div>

                <button 
                  onClick={() => setViewingUnconfirmed(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-base px-6 py-3.5 rounded-xl transition-all border-2 border-slate-200 shadow-sm flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                >
                  ✕ KEMBALI KE HALAMAN SEBELUMNYA
                </button>
              </div>

              {/* Table of Unconfirmed Athletes */}
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-5 text-center" style={{ width: "60px" }}>No</th>
                      <th className="py-4 px-5">Nama Lengkap</th>
                      <th className="py-4 px-5">Kontingen</th>
                      <th className="py-4 px-5">NIK / Tgl Lahir</th>
                      <th className="py-4 px-5">Kategori & Kelas</th>
                      <th className="py-4 px-5 text-center" style={{ width: "220px" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {athletes.filter(a => !a.isAcc).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Semua atlet telah tervalidasi ACC! 🎉
                        </td>
                      </tr>
                    ) : (
                      athletes.filter(a => !a.isAcc).map((atlet, index) => {
                        const displayClass = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
                        return (
                          <tr key={atlet.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 text-center text-slate-400">{index + 1}</td>
                            <td className="py-4 px-5 font-bold text-slate-900">{atlet.name}</td>
                            <td className="py-4 px-5 text-emerald-800 font-bold">{atlet.kontingen}</td>
                            <td className="py-4 px-5 text-slate-600">
                              <div>{atlet.nik}</div>
                              <div className="text-xs text-slate-400 font-semibold">{atlet.tglLahir}</div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="text-emerald-800 font-bold">{atlet.kategori}</span>
                              <div className="text-xs text-slate-500 font-semibold mt-0.5">{displayClass}</div>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => onSelectAthleteForDetail(atlet)}
                                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all"
                                >
                                  Detail
                                </button>
                                <button
                                  onClick={() => onToggleAcc(atlet.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all"
                                >
                                  ACC
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* TABLE: REKAP KONTINGEN */
            <div id="rekap-kontingen-section" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-none uppercase">
                  Rekap Kontingen
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">Klik pada kontingen untuk melihat daftar atlet terdaftar.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kontingen..."
                  value={searchKonti}
                  onChange={(e) => setSearchKonti(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-5 text-center" style={{ width: "60px" }}>No</th>
                    <th className="py-4 px-5">Nama Kontingen</th>
                    <th className="py-4 px-5">P. Jawab / WA</th>
                    <th className="py-4 px-5 text-center">Jumlah Atlet</th>

                    <th className="py-4 px-5 text-center" style={{ minWidth: "220px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredContingents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Tidak ada kontingen ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredContingents.map((konti, index) => {
                      const count = athleteCounts[konti.contingentName] || 0;
                      return (
                        <tr key={konti.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 text-center text-slate-400">{index + 1}</td>
                          <td className="py-4 px-5 font-bold text-emerald-800 text-base flex items-center gap-3">
                            {konti.photoUrl ? (
                              <img 
                                src={konti.photoUrl} 
                                alt={konti.contingentName} 
                                className="w-9 h-9 rounded-full object-cover border border-emerald-200 bg-white" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold flex items-center justify-center text-sm uppercase shrink-0">
                                {konti.contingentName.substring(0, 2)}
                              </div>
                            )}
                            <span>{konti.contingentName}</span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="font-semibold text-slate-800">{konti.pjName}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{konti.nowa}</div>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-full text-xs">
                              {count} Atlet
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex justify-center gap-1.5 flex-wrap">
                              {/* Atlet View */}
                              <button
                                onClick={() => setSelectedContingent(konti.contingentName)}
                                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all"
                              >
                                👥 Atlet
                              </button>

                              {/* ID Official */}
                              <button
                                onClick={() => onViewOfficialId(konti.pjName, konti.contingentName)}
                                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all"
                              >
                                🪪 ID Official
                              </button>

                              {/* WA Chat */}
                              <a
                                href={handleWAUrl(konti.nowa)}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1"
                              >
                                <MessageCircle size={12} /> Chat
                              </a>


                              {onDeleteContingent && (
                                <button
                                  onClick={() => {
                                    const pwd = window.prompt(`Yakin ingin MENGHAPUS kontingen ${konti.contingentName}? Ini juga akan menghapus semua atlet mereka.

Masukkan password master admin:`);
                                    if (pwd === "masteradmin") {
                                      onDeleteContingent(konti.contingentName);
                                    } else if (pwd !== null) {
                                      alert("Password master admin salah!");
                                    }
                                  }}
                                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                                >
                                  🗑️ Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )) : (
          /* DETAILED LISTING OF CONSTITUENT ATHLETES */
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
              <div>
                <button
                  onClick={() => setSelectedContingent(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-base px-6 py-3.5 rounded-xl transition-all border-2 border-slate-200 shadow-sm flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                >
                  ⬅️ KEMBALI KE HALAMAN SEBELUMNYA
                </button>
                <div className="flex items-center gap-3.5 mt-3 flex-wrap">
                  <h3 className="font-extrabold text-emerald-800 text-lg md:text-xl tracking-tight leading-none uppercase">
                    Detail Atlet: {selectedContingent}
                  </h3>
                  {onAddAthleteForContingent && (
                    <button
                      onClick={() => onAddAthleteForContingent(selectedContingent!)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1 shrink-0"
                    >
                      <span>➕ Tambah Peserta Baru</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 text-right">
                Total: <span className="text-slate-800 font-extrabold">{getFilteredAthletesOfContingent(selectedContingent).length} Atlet</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-5 text-center" style={{ width: "60px" }}>No</th>
                    <th className="py-4 px-5">Nama Lengkap</th>
                    <th className="py-4 px-5">NIK / Tgl Lahir</th>
                    <th className="py-4 px-5">Kategori / Kelas</th>
                    <th className="py-4 px-5 text-center">Jenis Kelamin</th>
                    <th className="py-4 px-5 text-center">Status ACC</th>
                    <th className="py-4 px-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {getFilteredAthletesOfContingent(selectedContingent).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Belum ada atlet didaftarkan oleh kontingen ini.
                      </td>
                    </tr>
                  ) : (
                    getFilteredAthletesOfContingent(selectedContingent).map((atlet, index) => {
                      const displayClass = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
                      return (
                        <tr key={atlet.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 text-center text-slate-400">{index + 1}</td>
                          <td className="py-4 px-5 font-bold text-slate-900">{atlet.name}</td>
                          <td className="py-4 px-5 text-slate-600">
                            <div>{atlet.nik}</div>
                            <div className="text-xs text-slate-400 font-semibold">{atlet.tglLahir}</div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-emerald-800 font-bold">{atlet.kategori}</span>
                            <div className="text-xs text-slate-500 font-semibold mt-0.5">{displayClass}</div>
                          </td>
                          <td className="py-4 px-5 text-center">{atlet.jk}</td>
                          <td className="py-4 px-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              atlet.isAcc
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {atlet.isAcc ? "✅ Valid" : "⏳ Tertunda"}
                            </span>
                            {atlet.revisiCatatan && (
                              <div className="text-[10px] text-rose-600 mt-1.5 font-bold max-w-[150px] mx-auto bg-rose-50 p-1 rounded border border-rose-100">
                                ⚠️ Revisi: {atlet.revisiCatatan}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => onSelectAthleteForDetail(atlet)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/10"
                              >
                                Detail Berkas
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DIRECT CONTINGENT REGISTRATION */}
      <AnimatePresence>
        {isDirectRegOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-800 space-y-6"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base md:text-lg uppercase tracking-tight">
                    🛡️ Registrasi Kontingen Baru
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    Daftarkan kontingen secara langsung oleh panitia pusat.
                  </p>
                </div>
                <button
                  onClick={() => setIsDirectRegOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all font-black text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDirectRegSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Nama Penanggung Jawab (PJ)
                    </label>
                    <input
                      type="text"
                      required
                      value={newPjName}
                      onChange={(e) => setNewPjName(e.target.value)}
                      placeholder="Contoh: Mas Bambang"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      No. WhatsApp PJ
                    </label>
                    <input
                      type="text"
                      required
                      value={newNowa}
                      onChange={(e) => setNewNowa(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Nama Kontingen / Padepokan
                  </label>
                  <input
                    type="text"
                    required
                    value={newContingentName}
                    onChange={(e) => setNewContingentName(e.target.value)}
                    placeholder="Contoh: Cabang Ponorogo"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Username Login
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Contoh: ponorogo_terate"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Password Login
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 4 karakter..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDirectRegOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3.5 rounded-xl transition-all uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/10 uppercase tracking-wider font-bold"
                  >
                    Daftarkan Kontingen
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LINK COPIED NOTIFICATION TOAST */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm text-white"
          >
            <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-400">
              <CheckCircle size={18} />
            </div>
            <div>
              <b className="text-xs uppercase tracking-tight text-emerald-400 block font-extrabold">Tautan Registrasi Disalin!</b>
              <span className="text-[10px] text-slate-300 font-semibold mt-0.5 block leading-normal">Tautan pendaftaran mandiri berhasil disalin ke clipboard untuk dibagikan ke official kontingen.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
