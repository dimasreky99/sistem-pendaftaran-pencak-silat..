import React from "react";
import { 
  BarChart3, Users, Scale, CreditCard, Award, Settings, Key, LogOut, ShieldAlert, X, Activity, User, Calendar,
  ChevronDown, ChevronUp, Trophy, ClipboardList, Sparkles, Shield, ListTodo
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  userRole: "admin" | "kontingen";
  username: string;
  onNavigate: (view: string) => void;
  activeView: string;
  onLogout: () => void;
  onGantiPassword: () => void;
  onlineStatus: { admin: string[]; kontingen: string[] };
  userPhotoUrl?: string;
  logoUrl?: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  eventTitle,
  userRole,
  username,
  onNavigate,
  activeView,
  onLogout,
  onGantiPassword,
  onlineStatus,
  userPhotoUrl,
  logoUrl
}: SidebarProps) {
  const [isSekretariatOpen, setIsSekretariatOpen] = React.useState(false);
  const [isPengaturanOpen, setIsPengaturanOpen] = React.useState(false);

  const mainMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["admin", "kontingen"] },
    { id: "profile", label: "Data Profil", icon: User, roles: ["admin", "kontingen"] },
    { id: "pembayaran_kontingen", label: "Pembayaran", icon: CreditCard, roles: ["kontingen"] },
    { id: "kelola-pembayaran", label: "Pembayaran", icon: CreditCard, roles: ["admin"] },
    { id: "atlet-seluruh", label: "Data Seluruh Peserta", icon: Users, roles: ["admin"] },
  ];

  const sekretariatItems = [
    { id: "bagan-pertandingan", label: "Bagan Pertandingan", icon: Award, roles: ["admin", "kontingen"] },
    { id: "jadwal-pertandingan", label: "Jadwal Pertandingan", icon: Calendar, roles: ["admin", "kontingen"] },
    { id: "timbang-badan", label: "Timbang Badan", icon: Scale, roles: ["admin"] },
    { id: "id-card-cetak", label: "Cetak ID Card", icon: CreditCard, roles: ["admin"] },
    { id: "rekap-peserta-kelas", label: "Rekapitulasi Kelas", icon: ListTodo, roles: ["admin", "kontingen"] },
    { id: "rekap-juara-peserta", label: "Rekap Nama Juara", icon: Trophy, roles: ["admin", "kontingen"] },
    { id: "rekap-juara-umum", label: "Rekap Juara Umum", icon: ClipboardList, roles: ["admin", "kontingen"] },
    { id: "peserta-terbaik", label: "Peserta Terbaik", icon: Sparkles, roles: ["admin", "kontingen"] },
  ];

  const filteredMainMenu = mainMenuItems.filter(item => item.roles.includes(userRole));
  const filteredSekretariatMenu = sekretariatItems.filter(item => item.roles.includes(userRole));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 backdrop-blur-[2px]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-slate-900 text-white z-50 flex flex-col shadow-2xl overflow-y-auto border-r border-slate-800"
          >
            {/* Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-slate-800 p-0.5 border border-slate-700" />
                ) : (
                  <div className="bg-emerald-600 p-2 rounded-lg text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-emerald-900/30">
                    ✊
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-lg text-slate-100 tracking-tight leading-none uppercase">
                    {eventTitle || "SILAT REG"}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Sistem Turnamen</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Slat */}
            <div className="p-5 bg-slate-900/50 border-b border-slate-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-500 uppercase overflow-hidden">
                {userPhotoUrl ? (
                  <img src={userPhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  username.substring(0, 2)
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-200">{username}</div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {userRole === "admin" ? "Master Admin" : "Official Kontingen"}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-6 px-4 space-y-1">
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Main Menu
              </div>
              {filteredMainMenu.map((item) => {
                const Icon = item.icon;
                const isSelected = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all text-left ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-900/20"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                    }`}
                  >
                    <Icon size={18} className={isSelected ? "text-white" : "text-slate-400"} />
                    {item.label}
                  </button>
                );
              })}

              {/* Sekretariat Pertandingan Dropdown */}
              {userRole === "admin" && (
                <>
                  <div className="pt-4 border-t border-slate-800/40">
                    <button
                      type="button"
                      onClick={() => setIsSekretariatOpen(!isSekretariatOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors text-left cursor-pointer"
                    >
                      <span>Sekretariat Pertandingan</span>
                      {isSekretariatOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {isSekretariatOpen && (
                    <div className="space-y-1.5 pl-2 transition-all">
                      {filteredSekretariatMenu.map((item) => {
                        const Icon = item.icon;
                        const isSelected = activeView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.id);
                              onClose();
                            }}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-xs transition-all text-left ${
                              isSelected
                                ? "bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-sm"
                                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                            }`}
                          >
                            <Icon size={15} className={isSelected ? "text-white" : "text-slate-500"} />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setIsPengaturanOpen(!isPengaturanOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors text-left cursor-pointer"
                >
                  <span>Pengaturan & Akun</span>
                  {isPengaturanOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
              
              {isPengaturanOpen && (
                <div className="space-y-1.5 pl-2 transition-all pb-4">
                  {userRole === "admin" && (
                    <>
                      {username === "DIM" && (
                        <>
                          <button
                            onClick={() => {
                              onNavigate("kelola-admin");
                              onClose();
                            }}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-xs transition-all text-left ${
                              activeView === "kelola-admin"
                                ? "bg-gradient-to-r from-emerald-850 to-emerald-700 text-white shadow-md border border-emerald-800/30"
                                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                            }`}
                          >
                            <User size={15} />
                            Manajemen Akun
                          </button>
                          <button
                            onClick={() => {
                              onNavigate("security-logs");
                              onClose();
                            }}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-xs transition-all text-left ${
                              activeView === "security-logs"
                                ? "bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white shadow-md shadow-rose-950/20 border border-rose-900/30"
                                : "text-rose-400 hover:bg-slate-800/60 hover:text-rose-300"
                            }`}
                          >
                            <Shield size={15} />
                            Security & Logs Monitor
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          onNavigate("settings");
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-xs transition-all text-left ${
                          activeView === "settings"
                            ? "bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-sm"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                        }`}
                      >
                        <Settings size={15} />
                        Pengaturan Sistem
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all text-left cursor-pointer"
                  >
                    <LogOut size={15} />
                    Keluar Aplikasi
                  </button>
                </div>
              )}
            </div>

            {/* Active Users Block */}
            {userRole === "admin" && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider mb-2.5">
                  <Activity size={12} className="text-emerald-500 animate-pulse" />
                  Status Online
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-slate-500 font-medium">Admin:</span>{" "}
                    <span className="text-emerald-400 font-semibold">
                      {onlineStatus.admin.length > 0 ? onlineStatus.admin.join(", ") : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Kontingen:</span>{" "}
                    <span className="text-sky-400 font-semibold max-w-[200px] overflow-hidden text-ellipsis inline-block align-bottom">
                      {onlineStatus.kontingen.length > 0 ? onlineStatus.kontingen.join(", ") : "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
