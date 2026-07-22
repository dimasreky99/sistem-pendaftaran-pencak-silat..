import { useGoogleLogin } from '@react-oauth/google';
import { syncAllDataToSheets, createNewSpreadsheet } from './lib/sheetsSync';
import React, { useState, useEffect } from "react";
import LoadingOverlay from "./components/LoadingOverlay";

import { 
  SystemSettings, Contingent, Athlete, ActivityLog, Competitor, MatchNode
} from "./types";
import { useFirebaseCollection, useFirebaseDoc } from "./useFirebaseState";
import { 
  DEFAULT_SETTINGS, INITIAL_CONTINGENTS, INITIAL_ATHLETES, INITIAL_LOGS, DEFAULT_KELAS_IPSI
} from "./constants";
import Sidebar from "./components/Sidebar";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardContingent from "./components/DashboardContingent";
import PembayaranContingentView from "./components/PembayaranContingentView";
import AthleteForm from "./components/AthleteForm";
import WeighIn from "./components/WeighIn";
import BracketsModule from "./components/BracketsModule";
import ScheduleModule from "./components/ScheduleModule";
import RekapJuaraPeserta from "./components/RekapJuaraPeserta";
import RekapJuaraUmum from "./components/RekapJuaraUmum";
import PesertaTerbaik from "./components/PesertaTerbaik";
import RekapPesertaKelas from "./components/RekapPesertaKelas";
import IdCardPreview from "./components/IdCardPreview";
import SystemSettingsComponent from "./components/SystemSettings";
import UserProfile from "./components/UserProfile";
import AdminSecurityLogs from "./components/AdminSecurityLogs";
import AdminManagement from "./components/AdminManagement";
import AdminPaymentManagement from "./components/AdminPaymentManagement";
import UserPasswordKontingen from "./components/UserPasswordKontingen";
import { 
  ShieldAlert, Menu, User, Lock, Users, ShieldCheck, FileText, CheckCircle, XCircle, LogOut, Activity, Scale, CreditCard, Award, Settings, Key, Phone, FileSignature, HelpCircle, Archive, Trash2, CheckSquare, RefreshCw, Plus, Download, Printer, X, Check, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Helper functions for auto-resolving brackets when an athlete fails weigh-in
const isDisqualified = (comp: Competitor | null | undefined, athletesList: Athlete[]) => {
  if (!comp || comp.isBye || comp.isPlaceholder) return false;
  const found = athletesList.find(
    a => a.name.toLowerCase().trim() === comp.nama.toLowerCase().trim() &&
         a.kontingen.toLowerCase().trim() === comp.kontingen.toLowerCase().trim()
  );
  return found ? (!!found.statusTimbang && found.statusTimbang !== "PAS" && found.statusTimbang !== "BELUM") : false;
};

const propagateWinner = (
  round: number, 
  matchIdx: number, 
  winnerComp: Competitor | undefined, 
  matches: Record<number, MatchNode[]>, 
  roundsCount: number
) => {
  const nextRound = round + 1;
  if (nextRound > roundsCount) return;

  const nextMatchIdx = Math.floor(matchIdx / 2);
  const playerSlot = matchIdx % 2 === 0 ? "p1" : "p2";
  
  if (!matches[nextRound]) {
    matches[nextRound] = [];
  }
  const nextMatch = matches[nextRound][nextMatchIdx];
  if (!nextMatch) return;

  const prevSlotComp = nextMatch[playerSlot];
  nextMatch[playerSlot] = winnerComp || null;

  if (winnerComp?.nama !== prevSlotComp?.nama) {
    nextMatch.score1 = undefined;
    nextMatch.score2 = undefined;
    const prevWinner = nextMatch.winner;
    nextMatch.winner = undefined;
    if (prevWinner) {
      propagateWinner(nextRound, nextMatchIdx, undefined, matches, roundsCount);
    }
  }
};

const autoResolveBracket = (bracketData: any, athletesList: Athlete[]) => {
  if (!bracketData || !bracketData.matches) return bracketData;
  
  const matches = bracketData.matches;
  const roundsCount = bracketData.roundsCount;

  for (let r = 1; r <= roundsCount; r++) {
    const roundMatches = matches[r] || [];
    for (let mIdx = 0; mIdx < roundMatches.length; mIdx++) {
      const match = roundMatches[mIdx];
      if (!match) continue;

      const p1Disq = isDisqualified(match.p1, athletesList);
      const p2Disq = isDisqualified(match.p2, athletesList);

      if (p1Disq || p2Disq) {
        let newWinner: Competitor | undefined = undefined;
        let score1: number | undefined = undefined;
        let score2: number | undefined = undefined;

        if (p1Disq && !p2Disq && match.p2 && !match.p2.isPlaceholder && !match.p2.isBye) {
          newWinner = match.p2;
          score2 = 1;
        } else if (p2Disq && !p1Disq && match.p1 && !match.p1.isPlaceholder && !match.p1.isBye) {
          newWinner = match.p1;
          score1 = 1;
        }

        if (match.winner?.nama !== newWinner?.nama) {
          match.winner = newWinner;
          match.score1 = score1;
          match.score2 = score2;
          propagateWinner(r, mIdx, newWinner, matches, roundsCount);
        }
      }
    }
  }

  let currentFinalWinner: Competitor | null = null;
  const finalRoundMatches = matches[roundsCount] || [];
  if (finalRoundMatches[0]?.winner) {
    currentFinalWinner = finalRoundMatches[0].winner;
  }
  bracketData.winner = currentFinalWinner;

  return bracketData;
};

const autoResolveAllBrackets = (athletesList: Athlete[]) => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("silat_bracket_")) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const bracketData = JSON.parse(saved);
          const updatedData = autoResolveBracket(bracketData, athletesList);
          localStorage.setItem(key, JSON.stringify(updatedData));
        } catch (e) {
          console.error("Error parsing bracket key", key, e);
        }
      }
    }
  }
};

export default function App() {
  // --- DATABASE STATES ---
  const [settings, setSettings, isSettingsLoaded] = useFirebaseDoc<SystemSettings>("globals/settings", DEFAULT_SETTINGS);

  const [contingents, setContingents, isContingentsLoaded] = useFirebaseCollection<Contingent>("contingents", INITIAL_CONTINGENTS);

  const [athletes, setAthletes, isAthletesLoaded] = useFirebaseCollection<Athlete>("athletes", INITIAL_ATHLETES);

  const [logs, setLogs, isLogsLoaded] = useFirebaseCollection<ActivityLog>("logs", INITIAL_LOGS);

  // --- APPLICATION STATE ---
  const [currentUser, setCurrentUser] = useState<Contingent | null>(() => {
    const saved = localStorage.getItem("silat_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState<string>(() => {
    const savedSession = localStorage.getItem("silat_session");
    return savedSession ? "dashboard" : "login";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  
  // Custom temporary view flags
  const [isEditingAthlete, setIsEditingAthlete] = useState(false);
  const [targetContingentForAdd, setTargetContingentForAdd] = useState<string | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [isViewingIdCard, setIsViewingIdCard] = useState(false);
  const [bulkIdCardsTarget, setBulkIdCardsTarget] = useState<string | null>(null);

  // Authentication inputs
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Contingent Registration inputs
  const [regPjName, setRegPjName] = useState("");
  const [regNowa, setRegNowa] = useState("");
  const [regContingentName, setRegContingentName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Sub admin creation
  const [subAdminUser, setSubAdminUser] = useState("");
  const [subAdminPass, setSubAdminPass] = useState("");

  // Search filter for global athletes table (for Admin view)
  const [globalAthleteSearch, setGlobalAthleteSearch] = useState("");
  const [globalAthleteCategoryFilter, setGlobalAthleteCategoryFilter] = useState("SEMUA");
  const [globalAthleteContingentFilter, setGlobalAthleteContingentFilter] = useState("SEMUA");
  const [globalAthleteGenderFilter, setGlobalAthleteGenderFilter] = useState("SEMUA");
  const [globalAthleteAccFilter, setGlobalAthleteAccFilter] = useState("SEMUA");
  const [globalAthleteClassFilter, setGlobalAthleteClassFilter] = useState("SEMUA");
  const [globalAthleteTimbangFilter, setGlobalAthleteTimbangFilter] = useState("SEMUA");
  const [globalAthletePage, setGlobalAthletePage] = useState(1);
  const [globalAthletePerPage, setGlobalAthletePerPage] = useState<number | "ALL">(20);
  const [showAdminAddAthleteContingentModal, setShowAdminAddAthleteContingentModal] = useState(false);
  const [showPrintAthletesPreview, setShowPrintAthletesPreview] = useState(false);

  // Online users state
  const [onlineStatus, setOnlineStatus] = useState<{ admin: string[]; kontingen: string[] }>({
    admin: [],
    kontingen: []
  });

  // --- GOOGLE SHEETS BACKUP ENGINE STATE & EFFECTS ---
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem("silat_spreadsheet_id") || "";
  });
  const [sheetSyncActive, setSheetSyncActive] = useState<boolean>(() => {
    return localStorage.getItem("silat_sheet_sync_active") === "true";
  });
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => {
    return localStorage.getItem("silat_sheet_last_synced") || "Belum pernah";
  });

  useEffect(() => {
    localStorage.setItem("silat_spreadsheet_id", spreadsheetId);
  }, [spreadsheetId]);

  useEffect(() => {
    localStorage.setItem("silat_sheet_sync_active", String(sheetSyncActive));
  }, [sheetSyncActive]);

  const googleLoginForSync = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        let currentSpreadsheetId = spreadsheetId;
        if (!currentSpreadsheetId.trim()) {
          currentSpreadsheetId = await createNewSpreadsheet(tokenResponse.access_token, "Data Turnamen Silat");
          setSpreadsheetId(currentSpreadsheetId);
        }
        
        const syncData = {
          athletes,
          logs,
          contingents
        };
        
        await syncAllDataToSheets(tokenResponse.access_token, currentSpreadsheetId, syncData);
        
        const updatedTime = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }).replace(/\//g, "-");
        setLastSyncedTime(updatedTime);
        localStorage.setItem("silat_sheet_last_synced", updatedTime);
        
        handleSecurityAddSystemLog(
          "SHEETS ENGINE",
          "Sheets Sync OK",
          `Sinkronisasi sukses.`
        );
      } catch (err: any) {
        handleSecurityAddSystemLog(
          "SHEETS ENGINE",
          "Sheets Sync Failed",
          err.message
        );
      }
    },
    scope: "https://www.googleapis.com/auth/spreadsheets"
  });

  const handleTriggerSheetsSync = async () => {
    setIsGlobalLoading(true);
    try {
      googleLoginForSync();
    } finally {
      setTimeout(() => setIsGlobalLoading(false), 2000); // give some time for popup
    }
  };

  useEffect(() => {
    if (sheetSyncActive && spreadsheetId) {
      const timer = setTimeout(() => {
        handleTriggerSheetsSync();
      }, 5000); // 5s debounce
      return () => clearTimeout(timer);
    }
  }, [athletes, sheetSyncActive, spreadsheetId]);


  // Session check for single device login
  // Update document title dynamically
  useEffect(() => {
    if (settings && settings.eventTitle) {
      document.title = settings.eventTitle;
    } else {
      document.title = "Sistem Pendaftaran Pencak Silat";
    }
  }, [settings?.eventTitle]);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      const storedUser = contingents.find((c: any) => c.username === currentUser.username);
      const currentSession = sessionStorage.getItem("current_session_token");
      if (storedUser && storedUser.sessionToken && storedUser.sessionToken !== currentSession) {
        alert("Sesi login Anda telah berakhir karena akun ini login di perangkat lain.");
        handleLogout();
      }
    }
  }, [currentUser, contingents]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem("silat_session", JSON.stringify(currentUser));
      } catch (e) {
        console.warn("Storage quota exceeded or unavailable for session:", e);
      }
    } else {
      localStorage.removeItem("silat_session");
    }
  }, [currentUser]);

  // Handle automatic registration window status matching the schedule
  useEffect(() => {
    if (settings.regStart && settings.regEnd) {
      const checkSchedule = () => {
        const now = new Date().getTime();
        const start = new Date(settings.regStart).getTime();
        const end = new Date(settings.regEnd).getTime();
        const active = now >= start && now <= end;
        const newStatus = active ? "ON" : "OFF";
        if (settings.regStatus !== newStatus) {
          setSettings(prev => ({
            ...prev,
            regStatus: newStatus
          }));
        }
      };
      checkSchedule();
      const interval = setInterval(checkSchedule, 15000);
      return () => clearInterval(interval);
    }
  }, [settings.regStart, settings.regEnd, settings.regStatus]);

  // --- AUTOMATIC TIMEOUT TIMER ---
  useEffect(() => {
    if (!currentUser) return;

    // 5 minutes (5 * 60 * 1000 = 300,000 ms) for kontingen, 3 hours (3 * 60 * 60 * 1000 = 10,800,000 ms) for admin
    const timeoutMs = currentUser.role === "admin" ? 10800000 : 300000;
    
    let timerId: any;

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        // Trigger auto-logout
        handleLogout();
        // Log to security log
        handleSecurityAddSystemLog(
          currentUser.role === "admin" ? currentUser.username : currentUser.contingentName,
          "AUTO_LOGOUT",
          `Inactivity timeout reached (${currentUser.role === "admin" ? "3 Jam" : "5 Menit"})`
        );
        alert(`Sesi Anda telah berakhir karena tidak ada aktivitas selama ${currentUser.role === "admin" ? "3 jam" : "5 menit"}. Silakan masuk kembali.`);
      }, timeoutMs);
    };

    // Event listeners
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleEvent = () => {
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, handleEvent));

    // Initialize timer
    resetTimer();

    return () => {
      if (timerId) clearTimeout(timerId);
      events.forEach(event => window.removeEventListener(event, handleEvent));
    };
  }, [currentUser]);

  // --- METHODS & LOGIC ---

  const appendLog = (action: string, detail: string) => {
    const wibDate = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: wibDate.replace(/\//g, "-"),
      user: currentUser ? (currentUser.role === "admin" ? currentUser.username : currentUser.contingentName) : "SYSTEM",
      action,
      detail
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = loginUser.trim();
    const p = loginPass.trim();

    if (!u || !p) {
      alert("Harap isi username dan password!");
      return;
    }

    // Direct check for Master Admin DIM
    if (u === "DIM" && p === "admin123") {
      const adminSession: Contingent = {
        id: "admin",
        pjName: "Dimas Reky",
        nowa: "081234567890",
        contingentName: "Panitia Pusat",
        username: "DIM",
        passwordHash: "admin123",
        role: "admin",
        paymentStatus: "Lunas",
        buktiTransferUrl: "",
        kodeUnik: 0
      };
      setCurrentUser(adminSession);
      setActiveView("dashboard");
      setLoginUser("");
      setLoginPass("");
      
      // Track login
      setOnlineStatus(prev => ({
        ...prev,
        admin: Array.from(new Set([...prev.admin, "DIM"]))
      }));
      return;
    }

    // Check contingents / sub-admins
    const found = contingents.find(c => c.username === u && c.passwordHash === p);
    if (found) {
      let updatedUser = { ...found };
      if (found.role !== "admin") {
        const newToken = Math.random().toString(36).substring(2);
        updatedUser.sessionToken = newToken;
        const updatedContingents = contingents.map(c => c.username === found.username ? updatedUser : c);
        setContingents(updatedContingents);
        sessionStorage.setItem("current_session_token", newToken);
      }

      setCurrentUser(updatedUser);
      setActiveView("dashboard");
      setLoginUser("");
      setLoginPass("");

      // Track online users
      if (found.role === "admin") {
        setOnlineStatus(prev => ({
          ...prev,
          admin: Array.from(new Set([...prev.admin, found.username]))
        }));
      } else {
        setOnlineStatus(prev => ({
          ...prev,
          kontingen: Array.from(new Set([...prev.kontingen, found.contingentName]))
        }));
      }
      return;
    }

    alert("Kredensial login Salah! Username atau password tidak terdaftar.");
  };

  const handleRegisterContingent = (e: React.FormEvent) => {
    e.preventDefault();
    const pj = regPjName.trim();
    const hp = regNowa.trim();
    const konti = regContingentName.trim();
    const u = regUsername.trim();
    const p = regPassword.trim();

    if (!pj || !hp || !konti || !u || !p) {
      alert("Seluruh bidang formulir wajib diisi!");
      return;
    }

    // Pengecekan username duplikat telah dinonaktifkan sesuai permintaan pengguna

    // Unique queue payment suffix code (e.g. random 100-400 as GAS code)
    const suffix = Math.floor(Math.random() * 300) + 100;

    const newKonti: Contingent = {
      id: "K_" + Date.now(),
      pjName: pj,
      nowa: hp,
      contingentName: konti,
      username: u,
      passwordHash: p,
      role: "kontingen",
      paymentStatus: "Belum Lunas",
      buktiTransferUrl: "",
      kodeUnik: suffix
    };

    setContingents(prev => [...prev, newKonti]);
    alert("Akun Kontingen Sukses Dibuat! Silakan login untuk melengkapi berkas atlet.");
    
    // Clear registration form
    setRegPjName("");
    setRegNowa("");
    setRegContingentName("");
    setRegUsername("");
    setRegPassword("");
    setActiveView("login");
    
    // WA Notification
    const adminNum = settings.adminWaNumber || "6282123456789";
    const waMessage = encodeURIComponent(`*PENDAFTARAN KONTINGEN BARU*\n\nNama Kontingen: ${konti}\nPenanggung Jawab: ${pj}\nNo WA: ${hp}\n\nMohon validasi kontingen ini.`);
    const waUrl = `https://wa.me/${adminNum}?text=${waMessage}`;
    window.open(waUrl, "_blank");
  };

  const handleCreateSubAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = subAdminUser.trim();
    const p = subAdminPass.trim();

    if (!u || !p) {
      alert("Lengkapi Username dan Password Admin!");
      return;
    }

    const dupUser = contingents.some(c => c.username.toLowerCase() === u.toLowerCase());
    if (dupUser) {
      alert("Username sudah digunakan!");
      return;
    }

    const newSub: Contingent = {
      id: "A_" + Date.now(),
      pjName: "Sub Admin",
      nowa: "-",
      contingentName: "Admin Pusat",
      username: u,
      passwordHash: p,
      role: "admin",
      paymentStatus: "Lunas",
      buktiTransferUrl: "",
      kodeUnik: 0
    };

    setContingents(prev => [...prev, newSub]);
    setSubAdminUser("");
    setSubAdminPass("");
    alert(`Sub Admin ${u} sukses ditambahkan!`);
    appendLog("TAMBAH ADMIN", `Membuat sub-admin baru: ${u}`);
  };

  const handleDeleteSubAdmin = (id: string, name: string) => {
    if (window.confirm(`Hapus sub admin ${name}?`)) {
      setContingents(prev => prev.filter(c => c.id !== id));
      appendLog("HAPUS ADMIN", `Menghapus sub-admin: ${name}`);
    }
  };

  const handleSaveAthlete = (athleteData: Omit<Athlete, "id" | "isAcc"> & { id?: string }) => {
    if (athleteData.id) {
      // EDIT MODE
      setAthletes(prev => prev.map(a => {
        if (a.id === athleteData.id) {
          return {
            ...a,
            ...athleteData,
            revisiCatatan: undefined // clear warning on fix
          };
        }
        return a;
      }));
      appendLog("EDIT ATLET", `Mengubah berkas atlet NIK: ${athleteData.nik}`);
    } else {
      // NEW REGISTRATION MODE
      const dupNik = athletes.some(a => a.nik === athleteData.nik);
      if (dupNik) {
        alert("Pendaftaran Gagal: NIK atlet ini sudah terdaftar sebelumnya!");
        return;
      }

      const newId = (athletes.length > 0 ? Math.max(...athletes.map(a => parseInt(a.id) || 1000)) + 1 : 1001).toString();
      const newAtlet: Athlete = {
        ...athleteData,
        id: newId,
        isAcc: false
      };

      setAthletes(prev => [...prev, newAtlet]);
      appendLog("TAMBAH ATLET", `Mendaftarkan atlet: ${athleteData.name} (${athleteData.nik})`);
      
      // WA Notification
      const adminNum = settings.adminWaNumber || "6282123456789";
      const waMessage = encodeURIComponent(`*PENDAFTARAN ATLET BARU*

Nama Atlet: ${athleteData.name}
NIK: ${athleteData.nik}
Kontingen: ${athleteData.kontingen}

Mohon validasi kelengkapan berkas atlet ini.`);
      const waUrl = `https://wa.me/${adminNum}?text=${waMessage}`;
      window.open(waUrl, "_blank");
    }

    setIsEditingAthlete(false);
    setSelectedAthlete(null);
    setTargetContingentForAdd(null);
    setActiveView("dashboard");
  };

  
  const handleUpdateInvoiceNumber = (contingentId: string, invoiceNum: string) => {
    setContingents(prev => prev.map(c => 
      c.id === contingentId ? { ...c, customInvoiceNumber: invoiceNum } : c
    ));
    appendLog("UPDATE INVOICE", `Admin mengubah nomor invoice untuk kontingen ID ${contingentId}.`);
  };


  const handleUpdatePaymentStatus = (contingentName: string, status: "Lunas" | "Belum Lunas") => {
    setContingents(prev => prev.map(c => {
      if (c.contingentName === contingentName) {
        return {
          ...c,
          paymentStatus: status
        };
      }
      return c;
    }));
    if (currentUser && currentUser.contingentName === contingentName) {
      setCurrentUser(prev => prev ? { ...prev, paymentStatus: status } : null);
    }
    appendLog("STATUS BAYAR", `Mengubah status bayar ${contingentName} menjadi ${status}`);
  };

  const handleDeleteContingent = (contingentName: string) => {
    setContingents(prev => prev.filter(c => c.contingentName !== contingentName));
    setAthletes(prev => prev.filter(a => a.kontingen !== contingentName));
    appendLog("HAPUS KONTINGEN", `Admin menghapus kontingen ${contingentName} beserta seluruh atletnya.`);
  };
  const handleAddContingent = (newC: Contingent) => {
    setContingents(prev => [...prev, newC]);
    appendLog("TAMBAH KONTINGEN", `Mendaftarkan kontingen baru secara langsung: ${newC.contingentName}`);
  };

  const handleUploadReceipt = (contingentName: string, base64Image: string) => {
    setContingents(prev => prev.map(c => {
      if (c.contingentName === contingentName) {
        return {
          ...c,
          buktiTransferUrl: base64Image
        };
      }
      return c;
    }));
    if (currentUser && currentUser.contingentName === contingentName) {
      setCurrentUser(prev => prev ? { ...prev, buktiTransferUrl: base64Image } : null);
    }
    appendLog("UPLOAD BUKTI", `Kontingen ${contingentName} mengunggah bukti pembayaran`);
    
    // WA Notification
    const adminNum = settings.adminWaNumber || "6282123456789";
    const waMessage = encodeURIComponent(`*UPLOAD BUKTI PEMBAYARAN*\n\nKontingen: ${contingentName}\nTelah mengunggah bukti pembayaran di sistem.\n\nSilakan cek dan validasi pembayaran pada menu Admin.`);
    const waUrl = `https://wa.me/${adminNum}?text=${waMessage}`;
    window.open(waUrl, "_blank");
  };

  const handleToggleAcc = (athleteId: string) => {
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        const nextVal = !a.isAcc;
        appendLog("ACC PESERTA", `${nextVal ? "Menyetujui" : "Membatalkan"} ACC Atlet ID: ${athleteId}`);
        return {
          ...a,
          isAcc: nextVal,
          revisiCatatan: undefined // clear revision on ACC
        };
      }
      return a;
    }));
  };

  const handleSecurityAddSubAdmin = (username: string, pass: string, pjName: string, nowa: string) => {
    const newSub: Contingent = {
      id: "admin-" + Date.now(),
      pjName,
      nowa,
      contingentName: `Panitia ${pjName}`,
      username,
      passwordHash: pass,
      role: "admin",
      paymentStatus: "Lunas",
      buktiTransferUrl: "",
      kodeUnik: 0
    };
    setContingents(prev => [...prev, newSub]);
  };

  const handleSecurityDeleteContingent = (id: string) => {
    setContingents(prev => prev.filter(c => c.id !== id));
  };

  const handleSecurityUpdatePassword = (id: string, newPass: string) => {
    setContingents(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          passwordHash: newPass
        };
      }
      return c;
    }));
  };

  const handleUpdateContingentPaymentStatus = (contingentId: string, status: "Lunas" | "Belum Lunas") => {
    setContingents(prev => prev.map(c => {
      if (c.id === contingentId) {
        handleSecurityAddSystemLog(
          currentUser?.username || "Admin",
          "Koreksi Status Pembayaran",
          `Mengubah status bayar kontingen ${c.contingentName} menjadi ${status}`
        );
        return {
          ...c,
          paymentStatus: status
        };
      }
      return c;
    }));
  };

  const handleUpdateContingentNominalRevisi = (contingentId: string, nominal?: number) => {
    setContingents(prev => prev.map(c => {
      if (c.id === contingentId) {
        handleSecurityAddSystemLog(
          currentUser?.username || "Admin",
          "Revisi Nominal Pembayaran",
          `Merevisi nominal kontingen ${c.contingentName} menjadi ${nominal !== undefined ? nominal : "Asli Sistem"}`
        );
        return {
          ...c,
          nominalRevisi: nominal
        };
      }
      return c;
    }));
  };

  const handleUpdateContingentDetails = (
    contingentId: string,
    updatedData: { pjName?: string; nowa?: string; passwordHash?: string }
  ) => {
    setContingents(prev => prev.map(c => {
      if (c.id === contingentId) {
        const changes: string[] = [];
        if (updatedData.pjName) changes.push(`PJ: ${updatedData.pjName}`);
        if (updatedData.nowa) changes.push(`WA: ${updatedData.nowa}`);
        if (updatedData.passwordHash) changes.push(`Sandi diperbarui`);
        handleSecurityAddSystemLog(
          currentUser?.username || "Admin",
          "Update Kredensial Kontingen",
          `Memperbarui data ${c.contingentName} (${changes.join(", ")})`
        );
        return {
          ...c,
          ...updatedData
        };
      }
      return c;
    }));
  };

  const handleSecurityAddSystemLog = (actor: string, activity: string, detail: string) => {
    const wibDate = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: wibDate.replace(/\//g, "-"),
      user: actor,
      action: activity,
      detail
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleSecurityClearLogs = () => {
    setLogs([]);
  };

  const handleRejectAthlete = (athleteId: string, notes: string) => {
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        appendLog("TOLAK ATLET", `Minta revisi atlet ID ${athleteId}: ${notes}`);
        return {
          ...a,
          isAcc: false,
          revisiCatatan: notes
        };
      }
      return a;
    }));
  };

  const handleDeleteAthlete = (athleteId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data atlet ini secara permanen?")) {
      setAthletes(prev => prev.filter(a => a.id !== athleteId));
      appendLog("HAPUS ATLET", `Menghapus atlet ID: ${athleteId}`);
      setSelectedAthlete(null);
    }
  };

  const handleSaveWeighIn = (
    athleteId: string,
    weight: number,
    status: "PAS" | "OVER" | "UNDER",
    waktuTimbang?: string,
    additionalData?: Partial<Athlete>
  ) => {
    setAthletes(prev => {
      const updated = prev.map(a => {
        if (a.id === athleteId) {
          appendLog("TIMBANG", `Timbang berat ${weight} kg (${status}) untuk atlet ID: ${athleteId}`);
          return {
            ...a,
            beratAktual: weight,
            statusTimbang: status,
            waktuTimbang: waktuTimbang || new Date().toLocaleString("id-ID"),
            ...additionalData
          };
        }
        return a;
      });
      autoResolveAllBrackets(updated);
      return updated;
    });
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    appendLog("PENGATURAN", "Memperbarui konfigurasi sistem turnamen");
  };

  const handleGantiPasswordActive = (oldPass: string, newPass: string) => {
    if (!currentUser) return;
    
    if (currentUser.passwordHash !== oldPass) {
      alert("Password lama salah!");
      return;
    }

    setContingents(prev => prev.map(c => {
      if (c.username === currentUser.username) {
        return {
          ...c,
          passwordHash: newPass
        };
      }
      return c;
    }));

    setCurrentUser(prev => prev ? { ...prev, passwordHash: newPass } : null);
    alert("Password berhasil diubah!");
    appendLog("GANTI PASSWORD", "Mengubah sandi akun");
  };

  const handleUpdateProfile = (updatedData: { pjName: string; nowa: string; photoUrl?: string; managerPhotoUrl?: string; official1Name?: string; official1PhotoUrl?: string; official2Name?: string; official2PhotoUrl?: string; }) => {
    if (!currentUser) return;

    setContingents(prev => prev.map(c => {
      if (c.username === currentUser.username) {
        return {
          ...c,
          pjName: updatedData.pjName,
          nowa: updatedData.nowa,
          photoUrl: updatedData.photoUrl,
          managerPhotoUrl: updatedData.managerPhotoUrl,
          official1Name: updatedData.official1Name,
          official1PhotoUrl: updatedData.official1PhotoUrl,
          official2Name: updatedData.official2Name,
          official2PhotoUrl: updatedData.official2PhotoUrl
        };
      }
      return c;
    }));

    if (currentUser.role === "admin") {
      let formattedWa = updatedData.nowa.replace(/\D/g, "");
      if (formattedWa.startsWith("0")) {
        formattedWa = "62" + formattedWa.substring(1);
      }
      setSettings(prev => ({
        ...prev,
        adminWaNumber: formattedWa
      }));
    }

    setCurrentUser(prev => prev ? { 
      ...prev, 
      pjName: updatedData.pjName, 
      nowa: updatedData.nowa, 
      photoUrl: updatedData.photoUrl 
    } : null);

    appendLog("UPDATE PROFIL", "Memperbarui data profil dan kontak");
  };

  const handleAccAll = () => {
    if (window.confirm("Apakah Anda yakin ingin memvalidasi ACC seluruh atlet tertunda secara otomatis untuk uji coba?")) {
      setAthletes(prev => prev.map(a => ({ ...a, isAcc: true, revisiCatatan: undefined })));
      alert("Seluruh berkas atlet berhasil divalidasi ACC!");
      appendLog("ACC MASSAL", "Menyetujui validasi seluruh peserta tanding tunda");
    }
  };

  const handleResetSystem = () => {
    if (window.confirm("PERINGATAN: Seluruh data atlet dan log tanding akan diarsipkan. Lanjut?")) {
      // Prepare backup JSON
      const backupData = {
        athletes,
        contingents,
        logs,
        settings,
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Arsip_Turnamen_Silat_${Date.now()}.json`;
      link.click();

      // Reset to defaults
      setAthletes([]);
      setContingents(INITIAL_CONTINGENTS);
      setLogs([]);
      setSettings(DEFAULT_SETTINGS);
      setCurrentUser(null);
      setActiveView("login");
      alert("Sistem berhasil diarsipkan & dikosongkan untuk turnamen baru!");
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      // Remove from online tracking
      if (currentUser.role === "admin") {
        setOnlineStatus(prev => ({ ...prev, admin: prev.admin.filter(x => x !== currentUser.username) }));
      } else {
        setOnlineStatus(prev => ({ ...prev, kontingen: prev.kontingen.filter(x => x !== currentUser.contingentName) }));
      }
    }
    setCurrentUser(null);
    setActiveView("login");
  };

  React.useEffect(() => {
    if (!currentUser) return;
    
    let timeoutId: any;
    const timeoutDuration = currentUser.role === "admin" ? 60 * 60 * 1000 : 3 * 60 * 1000;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert("Sesi Anda telah berakhir karena tidak ada aktivitas.");
        handleLogout();
      }, timeoutDuration);
    };

    resetTimer(); // init
    
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [currentUser]);

  // --- RENDERING ROUTER ---

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        if (currentUser?.role === "admin") {
          return (
            <DashboardAdmin
              contingents={contingents}
              athletes={athletes}
              settings={settings}
              onUpdatePayment={handleUpdatePaymentStatus}
              onToggleAcc={handleToggleAcc}
              onRejectAthlete={handleRejectAthlete}
              onDeleteAthlete={handleDeleteAthlete}
              onSelectAthleteForDetail={(a) => {
                setSelectedAthlete(a);
              }}
              onViewOfficialId={(pj, k) => {
                setSelectedAthlete({
                  id: "OFFICIAL_PREVIEW",
                  name: pj,
                  nik: "OFFICIAL",
                  tglLahir: "",
                  jk: "Putra",
                  kategori: "Official",
                  kelas: "OFFICIAL TEAM",
                  kontingen: k,
                  nowa: "",
                  customData: [],
                  fotos: [],
                  isAcc: true,
                  isOfficial: true as any
                });
                setIsViewingIdCard(true);
              }}
              onAccAll={handleAccAll}
              onTriggerRefresh={() => {
                setAthletes(INITIAL_ATHLETES);
                // Clear any cached brackets so that brackets refresh cleanly
                for (let i = localStorage.length - 1; i >= 0; i--) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith("silat_bracket_")) {
                    localStorage.removeItem(key);
                  }
                }
              }}
              onAddContingent={handleAddContingent}
              onDeleteContingent={handleDeleteContingent}
              onNavigateToPayment={() => setActiveView("kelola-pembayaran")}
              onNavigateToAthletes={() => setActiveView("atlet-seluruh")}
              onAddAthleteForContingent={(contingentName) => {
                setTargetContingentForAdd(contingentName);
                setSelectedAthlete(null);
                setIsEditingAthlete(true);
              }}
            />
          );
        } else if (currentUser) {
          return (
            <DashboardContingent
              contingent={currentUser}
              athletes={athletes}
              settings={settings}
              onNavigateToForm={() => {
                setSelectedAthlete(null);
                setIsEditingAthlete(true);
              }}
              onSelectAthleteForDetail={(a) => {
                setSelectedAthlete(a);
              }}
              onViewOfficialId={() => {
                setSelectedAthlete({
                  id: "OFFICIAL_PREVIEW",
                  name: currentUser.pjName,
                  nik: "OFFICIAL",
                  tglLahir: "",
                  jk: "Putra",
                  kategori: "Official",
                  kelas: "OFFICIAL TEAM",
                  kontingen: currentUser.contingentName,
                  nowa: "",
                  customData: [],
                  fotos: [],
                  isAcc: true,
                  isOfficial: true as any
                });
                setIsViewingIdCard(true);
              }}
              onUploadReceipt={handleUploadReceipt}
              onTriggerRefresh={() => {
                alert("Data sinkronisasi atlet sudah real-time terhubung dengan server (Firebase).");
              }}
            />
          );
        }
        return null;

      case "pembayaran_kontingen":
        if (currentUser && currentUser.role === "kontingen") {
          return (
            <PembayaranContingentView
              contingent={currentUser}
              athletes={athletes}
              settings={settings}
              onUploadReceipt={handleUploadReceipt}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          );
        }
        return null;

      case "atlet-seluruh": {
        const uniqueContingents = Array.from(new Set(athletes.map(a => a.kontingen))).sort();

        const filteredList = athletes.filter(a => {
          const matchSearch = a.name.toLowerCase().includes(globalAthleteSearch.toLowerCase()) ||
            a.kontingen.toLowerCase().includes(globalAthleteSearch.toLowerCase());
          const matchCat = globalAthleteCategoryFilter === "SEMUA" || a.kategori === globalAthleteCategoryFilter;
          const matchContingent = globalAthleteContingentFilter === "SEMUA" || a.kontingen === globalAthleteContingentFilter;
          const matchGender = globalAthleteGenderFilter === "SEMUA" || a.jk === globalAthleteGenderFilter;
          const matchAcc = globalAthleteAccFilter === "SEMUA" || 
            (globalAthleteAccFilter === "ACC" && a.isAcc) || 
            (globalAthleteAccFilter === "PENDING" && !a.isAcc);
          const matchClass = globalAthleteClassFilter === "SEMUA" || a.kelas.startsWith(globalAthleteClassFilter);
          const matchTimbang = globalAthleteTimbangFilter === "SEMUA" ||
            (globalAthleteTimbangFilter === "BELUM" && (!a.statusTimbang || a.statusTimbang === "BELUM")) ||
            a.statusTimbang === globalAthleteTimbangFilter;
          return matchSearch && matchCat && matchContingent && matchGender && matchAcc && matchClass && matchTimbang;
        });

        const perPage = globalAthletePerPage === "ALL" ? filteredList.length || 1 : globalAthletePerPage;
        const maxPages = Math.ceil(filteredList.length / perPage) || 1;
        const currentPageSafe = Math.min(globalAthletePage, maxPages);
        const startIndex = (currentPageSafe - 1) * perPage;
        const pageItems = filteredList.slice(startIndex, startIndex + perPage);

        // Export to Excel function
        const handleExportAthletesExcel = () => {
          let htmlContent = `
            <table border="1" style="border-collapse: collapse; font-family: sans-serif;">
              <thead>
                <tr style="background-color: #0f172a; color: white;">
                  <th colspan="8" style="padding: 12px; font-size: 16px; font-weight: bold; text-align: center;">
                    DAFTAR SELURUH PESERTA TURNAMEN - ${settings.eventTitle.toUpperCase()}
                  </th>
                </tr>
                <tr style="background-color: #334155; color: white; font-weight: bold; font-size: 11px;">
                  <th style="padding: 8px; text-align: center; width: 50px;">NO</th>
                  <th style="padding: 8px; text-align: left; width: 200px;">NAMA ATLET</th>
                  <th style="padding: 8px; text-align: left; width: 130px;">NIK</th>
                  <th style="padding: 8px; text-align: left; width: 150px;">KONTINGEN</th>
                  <th style="padding: 8px; text-align: left; width: 120px;">KATEGORI</th>
                  <th style="padding: 8px; text-align: left; width: 180px;">KELAS PERTANDINGAN</th>
                  <th style="padding: 8px; text-align: center; width: 80px;">JK</th>
                  <th style="padding: 8px; text-align: center; width: 100px;">STATUS ACC</th>
                </tr>
              </thead>
              <tbody>
          `;

          filteredList.forEach((atlet, idx) => {
            htmlContent += `
              <tr style="font-size: 11px;">
                <td style="padding: 6px; text-align: center;">${idx + 1}</td>
                <td style="padding: 6px; font-weight: bold;">${atlet.name}</td>
                <td style="padding: 6px;">'${atlet.nik}</td>
                <td style="padding: 6px; color: #9f1239; font-weight: bold;">${atlet.kontingen}</td>
                <td style="padding: 6px;">${atlet.kategori}</td>
                <td style="padding: 6px;">${atlet.kelas}</td>
                <td style="padding: 6px; text-align: center;">${atlet.jk}</td>
                <td style="padding: 6px; text-align: center; font-weight: bold; color: ${atlet.isAcc ? "#166534" : "#9a3412"};">
                  ${atlet.isAcc ? "ACC" : "PENDING"}
                </td>
              </tr>
            `;
          });

          htmlContent += `
              </tbody>
            </table>
          `;

          const template = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
              <meta charset="UTF-8">
            </head>
            <body>
              ${htmlContent}
            </body>
            </html>
          `;

          const blob = new Blob([template], { type: "application/vnd.ms-excel;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `daftar_peserta_${settings.eventTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.xls`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        if (showPrintAthletesPreview) {
          return (
            <div className="bg-white min-h-screen p-6 md:p-8 space-y-6 text-slate-800">
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 10mm 10mm;
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
                }
              `}} />

              <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl no-print">
                <div>
                  <h2 className="font-extrabold text-sm md:text-base uppercase">Pratinjau Cetak Daftar Peserta</h2>
                  <p className="text-xs text-slate-300 font-semibold mt-1">Sesuai dengan filter yang Anda pasang ({filteredList.length} Atlet).</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportAthletesExcel}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-600"
                  >
                    <Download size={13} /> Ekspor Excel
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer size={13} /> Cetak PDF / Print
                  </button>
                  <button
                    onClick={() => setShowPrintAthletesPreview(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 bg-white shadow-sm">
                <div className="flex flex-col items-center text-center border-b-2 border-slate-900 pb-5">
                  {settings.logoUrl && (
                    <img src={settings.logoUrl} alt="Logo" className="h-16 w-16 object-contain mb-2" />
                  )}
                  <h1 className="text-xl font-black text-slate-950 uppercase">{settings.eventTitle}</h1>
                  <h2 className="text-xs font-bold text-slate-500 tracking-wider mt-1">
                    LAPORAN RESMI DAFTAR PESERTA TURNAMEN PENCAK SILAT
                  </h2>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 uppercase font-mono">
                    <span>Filter Kategori: {globalAthleteCategoryFilter}</span>
                    <span>Filter Kelas: {globalAthleteClassFilter}</span>
                    <span>Filter Kontingen: {globalAthleteContingentFilter}</span>
                    <span>Filter Gender: {globalAthleteGenderFilter}</span>
                    <span>Filter Status ACC: {globalAthleteAccFilter}</span>
                    <span>Filter Timbang: {globalAthleteTimbangFilter}</span>
                  </div>
                </div>

                <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 uppercase">
                      <th className="py-2 px-2 text-center border border-slate-300" style={{ width: "4%" }}>No</th>
                      <th className="py-2 px-2 border border-slate-300" style={{ width: "23%" }}>Nama Atlet</th>
                      <th className="py-2 px-2 border border-slate-300" style={{ width: "13%" }}>NIK</th>
                      <th className="py-2 px-2 border border-slate-300" style={{ width: "15%" }}>Kontingen</th>
                      <th className="py-2 px-2 border border-slate-300" style={{ width: "12%" }}>Kategori</th>
                      <th className="py-2 px-2 border border-slate-300" style={{ width: "15%" }}>Kelas</th>
                      <th className="py-2 px-2 text-center border border-slate-300" style={{ width: "8%" }}>JK</th>
                      <th className="py-2 px-2 text-center border border-slate-300" style={{ width: "10%" }}>Status ACC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((atlet, idx) => (
                      <tr key={atlet.id} className="border-b border-slate-200 hover:bg-slate-50 font-medium">
                        <td className="py-2 px-2 text-center border border-slate-300 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2 border border-slate-300 font-bold text-slate-950 uppercase">{atlet.name}</td>
                        <td className="py-2 px-2 border border-slate-300 font-mono text-slate-700">{atlet.nik}</td>
                        <td className="py-2 px-2 border border-slate-300 font-semibold text-rose-700 uppercase">{atlet.kontingen}</td>
                        <td className="py-2 px-2 border border-slate-300 uppercase text-slate-700">{atlet.kategori}</td>
                        <td className="py-2 px-2 border border-slate-300 uppercase text-slate-800">{atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "")}</td>
                        <td className="py-2 px-2 text-center border border-slate-300 uppercase font-semibold">{atlet.jk}</td>
                        <td className="py-2 px-2 text-center border border-slate-300 font-bold">
                          <span className={atlet.isAcc ? "text-emerald-700" : "text-amber-700"}>
                            {atlet.isAcc ? "ACC" : "PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          Tidak ditemukan data atlet tervalidasi yang cocok dengan kriteria filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight leading-none">
                  Data Seluruh Peserta Turnamen
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">Audit dan validasi seluruh atlet dari seluruh kontingen.</p>
              </div>

              {/* Action Buttons: Add, Excel, PDF */}
              <div className="flex flex-wrap gap-2.5">
                {currentUser?.role === "admin" && (
                  <button
                    onClick={() => setShowAdminAddAthleteContingentModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> TAMBAH ATLET BARU
                  </button>
                )}
                <button
                  onClick={handleExportAthletesExcel}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} /> EXCEL
                </button>
                <button
                  onClick={() => setShowPrintAthletesPreview(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer size={14} /> PREVIEW CETAK
                </button>
              </div>
            </div>

            {/* Filters panel */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3.5 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cari Nama / Kontingen</label>
                <input
                  type="text"
                  placeholder="Cari atlet..."
                  value={globalAthleteSearch}
                  onChange={(e) => {
                    setGlobalAthleteSearch(e.target.value);
                    setGlobalAthletePage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter Kategori</label>
                <select
                  value={globalAthleteCategoryFilter}
                  onChange={(e) => {
                    setGlobalAthleteCategoryFilter(e.target.value);
                    setGlobalAthleteClassFilter("SEMUA");
                    setGlobalAthletePage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="SEMUA">-- Semua Kategori --</option>
                  {Object.keys(settings.classData).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter Kelas</label>
                <select
                  value={globalAthleteClassFilter}
                  onChange={(e) => {
                    setGlobalAthleteClassFilter(e.target.value);
                    setGlobalAthletePage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="SEMUA">-- Semua Kelas --</option>
                  {(() => {
                    if (globalAthleteCategoryFilter === "SEMUA" || !settings.classData[globalAthleteCategoryFilter]) {
                      return Array.from(new Set(athletes.map(a => a.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "")))).sort().map(cl => (
                        <option key={cl} value={cl}>{cl}</option>
                      ));
                    }
                    return settings.classData[globalAthleteCategoryFilter].classes.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ));
                  })()}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter Kontingen</label>
                <select
                  value={globalAthleteContingentFilter}
                  onChange={(e) => {
                    setGlobalAthleteContingentFilter(e.target.value);
                    setGlobalAthletePage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="SEMUA">-- Semua Kontingen --</option>
                  {uniqueContingents.map(konti => (
                    <option key={konti} value={konti}>{konti}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter Gender</label>
                <select
                  value={globalAthleteGenderFilter}
                  onChange={(e) => {
                    setGlobalAthleteGenderFilter(e.target.value);
                    setGlobalAthletePage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="SEMUA">-- Semua Gender --</option>
                  <option value="Putra">Putra</option>
                  <option value="Putri">Putri</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter Status ACC</label>
                <select
                  value={globalAthleteAccFilter}
                  onChange={(e) => {
                    setGlobalAthleteAccFilter(e.target.value);
                    setGlobalAthletePage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="SEMUA">-- Semua Status --</option>
                  <option value="ACC">ACC Valid</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter Timbang</label>
                <select
                  value={globalAthleteTimbangFilter}
                  onChange={(e) => {
                    setGlobalAthleteTimbangFilter(e.target.value);
                    setGlobalAthletePage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="SEMUA">-- Semua Timbang --</option>
                  <option value="PAS">Sah / Pas (PAS)</option>
                  <option value="OVER">Kelebihan (OVER)</option>
                  <option value="UNDER">Kurang (UNDER)</option>
                  <option value="BELUM">Belum Timbang</option>
                </select>
              </div>
            </div>

            {/* Info and Page indicators */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl">
              <span>Menampilkan <strong className="text-slate-800">{Math.min(startIndex + 1, filteredList.length)}-{Math.min(startIndex + perPage, filteredList.length)}</strong> dari <strong className="text-slate-800">{filteredList.length}</strong> atlet terfilter</span>
              <span>Halaman <strong className="text-slate-800">{currentPageSafe}</strong> dari <strong className="text-slate-800">{maxPages}</strong></span>
            </div>

            {/* Global Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-5 text-center" style={{ width: "60px" }}>No</th>
                    <th className="py-4 px-5">Atlet / Kontingen</th>
                    <th className="py-4 px-5">Kategori & Kelas</th>
                    <th className="py-4 px-5 text-center">Jenis Kelamin</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {pageItems.map((atlet, index) => {
                    const cleanClass = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
                    return (
                      <tr key={atlet.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5 text-center text-slate-400">{startIndex + index + 1}</td>
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 text-base">{atlet.name}</div>
                          <span className="text-xs text-red-800 font-bold block mt-0.5">{atlet.kontingen}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-slate-800 font-bold">{atlet.kategori}</span>
                          <div className="text-xs text-slate-400 font-semibold mt-0.5">{cleanClass}</div>
                        </td>
                        <td className="py-4 px-5 text-center">{atlet.jk}</td>
                        <td className="py-4 px-5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            atlet.isAcc ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {atlet.isAcc ? "ACC Valid" : "Pending"}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => setSelectedAthlete(atlet)}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            Audit Berkas
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold bg-slate-50/20">
                        Tidak ditemukan data atlet yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="uppercase tracking-wider">Tampilkan:</span>
                <select
                  value={globalAthletePerPage}
                  onChange={(e) => {
                    setGlobalAthletePerPage(e.target.value === "ALL" ? "ALL" : Number(e.target.value));
                    setGlobalAthletePage(1);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none cursor-pointer text-slate-800 shadow-sm"
                >
                  <option value={10}>10 Data</option>
                  <option value={20}>20 Data</option>
                  <option value={50}>50 Data</option>
                  <option value="ALL">Semua Data</option>
                </select>
              </div>
              
              {maxPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                <button
                  disabled={currentPageSafe <= 1}
                  onClick={() => setGlobalAthletePage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  ◀ SEBELUMNYA
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: maxPages }).map((_, i) => {
                    const p = i + 1;
                    // Show adjacent pages, or first/last
                    if (maxPages > 8 && Math.abs(p - currentPageSafe) > 2 && p !== 1 && p !== maxPages) {
                      if (p === 2 || p === maxPages - 1) {
                        return <span key={p} className="px-1.5 text-slate-400 text-xs">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setGlobalAthletePage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          currentPageSafe === p
                            ? "bg-slate-950 text-white"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={currentPageSafe >= maxPages}
                  onClick={() => setGlobalAthletePage(prev => Math.min(prev + 1, maxPages))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  SELANJUTNYA ▶
                </button>
              </div>
            )}
            </div>

            {/* Modal Selector for Target Contingent for Adding Athlete */}
            {showAdminAddAthleteContingentModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-950 text-base uppercase">Pilih Kontingen Target</h3>
                    <button
                      onClick={() => setShowAdminAddAthleteContingentModal(false)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-normal">
                    Pilih nama kontingen resmi untuk mendaftarkan atlet baru di bawah koordinasi tim mereka.
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {contingents
                      .filter(c => c.role === "kontingen")
                      .map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setTargetContingentForAdd(c.contingentName);
                            setSelectedAthlete(null);
                            setIsEditingAthlete(true);
                            setShowAdminAddAthleteContingentModal(false);
                          }}
                          className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-xl text-left transition-all font-bold text-xs text-slate-800 flex justify-between items-center cursor-pointer group"
                        >
                          <span>{c.contingentName}</span>
                          <span className="text-[10px] text-slate-400 group-hover:text-emerald-700 font-bold font-mono">
                            {athletes.filter(a => a.kontingen === c.contingentName).length} Atlet
                          </span>
                        </button>
                      ))}
                    {contingents.filter(c => c.role === "kontingen").length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-6 font-semibold">Belum ada akun kontingen terdaftar.</p>
                    )}
                  </div>
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setShowAdminAddAthleteContingentModal(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2 rounded-xl transition-all"
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

      case "timbang-badan":
        return <WeighIn athletes={athletes} onSaveWeighIn={handleSaveWeighIn} contingents={contingents} />;

      case "bagan-pertandingan":
        return <BracketsModule athletes={athletes} userRole={currentUser?.role || "kontingen"} />;

      case "jadwal-pertandingan":
        return <ScheduleModule athletes={athletes} userRole={currentUser?.role || "kontingen"} />;

      case "rekap-peserta-kelas":
        return <RekapPesertaKelas athletes={athletes} />;
      case "rekap-juara-peserta":
        return <RekapJuaraPeserta athletes={athletes} />;

      case "rekap-juara-umum":
        return <RekapJuaraUmum athletes={athletes} contingents={contingents} />;

      case "peserta-terbaik":
        return <PesertaTerbaik athletes={athletes} settings={settings} />;

      case "id-card-cetak":
        return (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                Cetak Massal ID Card Badge Lanyard
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Tampilkan list ID Card atlet dari kontingen spesifik untuk print massal.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {contingents
                .filter(c => c.role === "kontingen")
                .map(c => (
                  <button
                    key={c.id}
                    onClick={() => setBulkIdCardsTarget(c.contingentName)}
                    className="p-4 bg-slate-50 border border-slate-150 hover:border-red-600 rounded-2xl text-left transition-all space-y-1.5"
                  >
                    <strong className="text-xs font-bold text-slate-800 block truncate">{c.contingentName}</strong>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {athletes.filter(a => a.kontingen === c.contingentName && a.isAcc).length} Atlet Ter-ACC
                    </span>
                  </button>
                ))}
            </div>
          </div>
        );

      case "sub-admin":
        if (!currentUser || currentUser.role !== "admin" || currentUser.username !== "DIM") {
          return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center py-12">
              <span className="text-4xl">🛑</span>
              <h2 className="text-lg font-extrabold text-slate-800 mt-3">Akses Terbatas</h2>
              <p className="text-slate-500 text-xs mt-1">Halaman ini hanya dapat diakses oleh Super Admin (DIM).</p>
            </div>
          );
        }
        return (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                Kelola Pengguna Sub-Admin
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">Beri wewenang audit ke asisten panitia dengan pendelegasian akun admin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form Creation */}
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4 h-fit">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <User size={14} className="text-red-700" /> Tambah Sub Admin
                </h4>
                <form onSubmit={handleCreateSubAdmin} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Username Admin</label>
                    <input
                      type="text"
                      required
                      value={subAdminUser}
                      onChange={(e) => setSubAdminUser(e.target.value)}
                      placeholder="Ketik username..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Sandi / Password</label>
                    <input
                      type="password"
                      required
                      value={subAdminPass}
                      onChange={(e) => setSubAdminPass(e.target.value)}
                      placeholder="Ketik password..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-800 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all"
                  >
                    Simpan Admin Baru
                  </button>
                </form>
              </div>

              {/* Sub admin listing */}
              <div className="col-span-1 md:col-span-2 bg-slate-50/50 rounded-2xl p-5 border border-slate-100 h-fit space-y-4">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                  Daftar Sub Admin Aktif
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4 text-center">No</th>
                        <th className="py-2.5 px-4">Username</th>
                        <th className="py-2.5 px-4">Kredensial Sandi</th>
                        <th className="py-2.5 px-4 text-center">Wewenang</th>
                        <th className="py-2.5 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-semibold text-slate-700">
                      {contingents
                        .filter(c => c.role === "admin" && c.username !== "DIM")
                        .map((sub, idx) => (
                          <tr key={sub.id} className="bg-white">
                            <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">{sub.username}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-400">{sub.passwordHash}</td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">Audit ACC</span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <button
                                onClick={() => handleDeleteSubAdmin(sub.id, sub.username)}
                                className="text-rose-600 hover:text-rose-800 font-bold"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      {contingents.filter(c => c.role === "admin" && c.username !== "DIM").length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 bg-white">
                            Belum ada sub-admin didelegasikan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <SystemSettingsComponent
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSystem={handleResetSystem}
          />
        );

      case "profile":
        return (
          <UserProfile
            currentUser={currentUser}
            onUpdatePassword={handleGantiPasswordActive}
            onUpdateProfile={handleUpdateProfile}
          />
        );

      case "security-logs":
        if (!currentUser || currentUser.role !== "admin" || currentUser.username !== "DIM") {
          return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center py-12">
              <span className="text-4xl">🛑</span>
              <h2 className="text-lg font-extrabold text-slate-800 mt-3">Akses Terbatas</h2>
              <p className="text-slate-500 text-xs mt-1">Halaman ini hanya dapat diakses oleh Super Admin (DIM).</p>
            </div>
          );
        }
        return (
          <AdminSecurityLogs
            contingents={contingents}
            logs={logs}
            onAddSystemLog={handleSecurityAddSystemLog}
            onClearLogs={handleSecurityClearLogs}
            athletes={athletes}
            spreadsheetId={spreadsheetId}
            setSpreadsheetId={setSpreadsheetId}
            sheetSyncActive={sheetSyncActive}
            setSheetSyncActive={setSheetSyncActive}
            lastSyncedTime={lastSyncedTime}
            onTriggerSheetsSync={handleTriggerSheetsSync}
            onlineStatus={onlineStatus}
          />
        );

      case "kelola-admin":
        if (!currentUser || currentUser.role !== "admin" || currentUser.username !== "DIM") {
          return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center py-12">
              <span className="text-4xl">🛑</span>
              <h2 className="text-lg font-extrabold text-slate-800 mt-3">Akses Terbatas</h2>
              <p className="text-slate-500 text-xs mt-1">Halaman ini hanya dapat diakses oleh Super Admin (DIM).</p>
            </div>
          );
        }
        return (
          <div className="space-y-8">
            <AdminManagement
              contingents={contingents}
              onAddSubAdmin={handleSecurityAddSubAdmin}
              onDeleteContingent={handleSecurityDeleteContingent}
              onUpdateContingentPassword={handleSecurityUpdatePassword}
              onAddSystemLog={handleSecurityAddSystemLog}
            />
            <div className="pt-8 border-t border-slate-200">
              <UserPasswordKontingen
                contingents={contingents}
                onUpdateContingentDetails={handleUpdateContingentDetails}
              />
            </div>
          </div>
        );

      case "kelola-pembayaran":
        if (!currentUser || currentUser.role !== "admin") {
          return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center py-12">
              <span className="text-4xl">🛑</span>
              <h2 className="text-lg font-extrabold text-slate-800 mt-3">Akses Terbatas</h2>
              <p className="text-slate-500 text-xs mt-1">Halaman ini hanya dapat diakses oleh Admin.</p>
            </div>
          );
        }
        return (
          <AdminPaymentManagement
            contingents={contingents}
            athletes={athletes}
            settings={settings}
            onUpdateContingentPaymentStatus={handleUpdateContingentPaymentStatus}
            onUpdateContingentNominalRevisi={handleUpdateContingentNominalRevisi}
            onUpdateInvoiceNumber={handleUpdateInvoiceNumber}
          />
        );

      case "user-password-kontingen":
        if (!currentUser || currentUser.role !== "admin") {
          return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center py-12">
              <span className="text-4xl">🛑</span>
              <h2 className="text-lg font-extrabold text-slate-800 mt-3">Akses Terbatas</h2>
              <p className="text-slate-500 text-xs mt-1">Halaman ini hanya dapat diakses oleh Admin.</p>
            </div>
          );
        }
        return (
          <UserPasswordKontingen
            contingents={contingents}
            onUpdateContingentDetails={handleUpdateContingentDetails}
          />
        );

      default:
        return null;
    }
  };

  if (!isSettingsLoaded || !isContingentsLoaded || !isAthletesLoaded || !isLogsLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans">
        <span className="w-12 h-12 border-4 border-slate-700 border-t-red-600 rounded-full animate-spin mb-4"></span>
        <p className="font-bold text-lg">Menghubungkan ke Cloud Database...</p>
        <p className="text-slate-400 text-sm mt-2">Sinkronisasi data real-time perangkat.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-800 selection:text-white flex flex-col justify-between">
      
      {/* 1. APPS CONTAINER FOR LOGGED IN VIEW */}
      {currentUser ? (
        <div className="flex-1 flex flex-col pb-16">
          {/* Header Bar */}
          <header className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-30 shadow-md border-b border-slate-800 flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition-all"
              >
                <Menu size={22} />
              </button>
              <div className="flex items-center gap-2.5">
                {settings.logoUrl && (
                  <img src={settings.logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded-md bg-white p-0.5" />
                )}
                <div>
                  <h1 className="font-extrabold text-sm md:text-base tracking-tight leading-none uppercase">{settings.eventTitle}</h1>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Sistem Pendaftaran</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-200">{currentUser.contingentName}</div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                  {currentUser.role === "admin" ? "MASTER ADMIN" : `PJ: ${currentUser.pjName}`}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-slate-700/50"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* Sidebar drawer component */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            eventTitle={settings.eventTitle}
            userRole={currentUser.role}
            username={currentUser.role === "admin" ? currentUser.username : currentUser.contingentName}
            userPhotoUrl={currentUser.photoUrl}
            logoUrl={settings.logoUrl}
            onNavigate={(v) => {
              setActiveView(v);
              setSelectedAthlete(null);
              setIsEditingAthlete(false);
              setIsViewingIdCard(false);
              setBulkIdCardsTarget(null);
            }}
            activeView={activeView}
            onLogout={handleLogout}
            onGantiPassword={() => {
              const oldP = prompt("Ketik password lama Anda:");
              if (!oldP) return;
              const newP = prompt("Ketik password BARU Anda:");
              if (!newP) return;
              handleGantiPasswordActive(oldP, newP);
            }}
            onlineStatus={onlineStatus}
          />

          {/* Main workspace container */}
          <main className={`flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto relative z-10 ${bulkIdCardsTarget ? "no-print" : ""}`}>
            <AnimatePresence mode="wait">
              {isEditingAthlete ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <AthleteForm
                    initialAthlete={selectedAthlete}
                    settings={settings}
                    contingentName={selectedAthlete ? selectedAthlete.kontingen : (targetContingentForAdd || currentUser?.contingentName || "")}
                    athletes={athletes}
                    onSave={handleSaveAthlete}
                    onCancel={() => {
                      setIsEditingAthlete(false);
                      setSelectedAthlete(null);
                      setTargetContingentForAdd(null);
                    }}
                  />
                </motion.div>
              ) : isViewingIdCard && selectedAthlete ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <IdCardPreview
                    athletes={
                      selectedAthlete.id === "OFFICIAL_PREVIEW" && currentUser ? [
                        { name: currentUser.pjName || "Penanggung Jawab", kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "mgr", isOfficial: true, officialRole: "MANAGER", photoUrl: currentUser.managerPhotoUrl },
                        ...(currentUser.official1Name || currentUser.official1PhotoUrl ? [{ name: currentUser.official1Name || currentUser.contingentName, kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "off1", isOfficial: true, officialRole: "OFFICIAL", photoUrl: currentUser.official1PhotoUrl }] : [{ name: currentUser.contingentName, kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "off1", isOfficial: true, officialRole: "OFFICIAL" }]),
                        ...(currentUser.official2Name || currentUser.official2PhotoUrl ? [{ name: currentUser.official2Name || currentUser.contingentName, kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "off2", isOfficial: true, officialRole: "OFFICIAL", photoUrl: currentUser.official2PhotoUrl }] : [{ name: currentUser.contingentName, kontingen: currentUser.contingentName, kategori: "Official", kelas: "", id: "off2", isOfficial: true, officialRole: "OFFICIAL" }])
                      ] : [selectedAthlete]
                    }
                    settings={settings}
                    onCancel={() => {
                      setIsViewingIdCard(false);
                      setSelectedAthlete(null);
                    }}
                  />
                </motion.div>
              ) : bulkIdCardsTarget ? (
                /* BULK PRINT LAYOUT */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <IdCardPreview
                    athletes={(() => {
                      const tgt = contingents.find(c => c.contingentName === bulkIdCardsTarget);
                      const officials = tgt ? [
                        { name: tgt.pjName || "Penanggung Jawab", kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "mgr", isOfficial: true, officialRole: "MANAGER", photoUrl: tgt.managerPhotoUrl },
                        ...(tgt.official1Name || tgt.official1PhotoUrl ? [{ name: tgt.official1Name || tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "off1", isOfficial: true, officialRole: "OFFICIAL", photoUrl: tgt.official1PhotoUrl }] : [{ name: tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "off1", isOfficial: true, officialRole: "OFFICIAL" }]),
                        ...(tgt.official2Name || tgt.official2PhotoUrl ? [{ name: tgt.official2Name || tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "off2", isOfficial: true, officialRole: "OFFICIAL", photoUrl: tgt.official2PhotoUrl }] : [{ name: tgt.contingentName, kontingen: tgt.contingentName, kategori: "Official", kelas: "", id: "off2", isOfficial: true, officialRole: "OFFICIAL" }])
                      ] : [];
                      return [...officials, ...athletes.filter(a => a.kontingen === bulkIdCardsTarget && a.isAcc)];
                    })()}
                    settings={settings}
                    onCancel={() => setBulkIdCardsTarget(null)}
                  />
                </motion.div>
              ) : (
                /* MAIN ACTIVE VIEW */
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderActiveView()}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* 2. PRINT TARGET OVERLAY (ONLY DISPLAYED IN PRINT MODE FOR BADGES) */}
          <div className="hidden print:block absolute inset-0 bg-white">
            {/* If printing bulk */}
            {bulkIdCardsTarget && (
              <div className="flex flex-wrap justify-start gap-8 bg-white p-0">
                {athletes
                  .filter(a => a.kontingen === bulkIdCardsTarget && a.isAcc)
                  .map(a => {
                    let photoUrl = a.fotos[0] || "";
                    const bgThemes: Record<string, string> = {
                      slate: "from-slate-900 via-slate-800 to-slate-950 text-white border border-slate-800",
                      red: "from-red-950 via-red-900 to-slate-950 text-white border border-red-950",
                      green: "from-emerald-950 via-emerald-900 to-slate-950 text-white border border-emerald-950",
                      blue: "from-blue-950 via-blue-900 to-slate-950 text-white border border-blue-950",
                      terate: "from-zinc-950 via-zinc-900 to-black text-white border-2 border-zinc-800"
                    };
                    const activeBg = bgThemes[settings.idCardBgColor] || bgThemes.slate;

                    return (
                      <div 
                        key={a.id}
                        className={`relative w-[280px] h-[395px] rounded-2xl overflow-hidden shadow-none border border-slate-300 text-center flex flex-col justify-between p-4 bg-gradient-to-b page-break-inside-avoid ${activeBg}`}
                        style={{
                          backgroundImage: settings.idCardBg ? `url(${settings.idCardBg})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "inline-flex",
                          float: "left",
                          margin: "0 10px 10px 0"
                        }}
                      >
                        {!settings.idCardBg && <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />}
                        
                        <div className="flex flex-col items-center mt-1">
                          {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-8 max-w-[80%] object-contain mb-1" />}
                          <h4 className="font-black text-[9px] text-white tracking-widest uppercase truncate max-w-full drop-shadow">
                            {settings.eventTitle}
                          </h4>
                        </div>

                        <div className="w-[85px] h-[108px] bg-slate-800/80 border border-slate-700/60 rounded-xl mx-auto flex items-center justify-center overflow-hidden">
                          {photoUrl ? <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" /> : <div className="text-slate-500 text-[8px] font-black uppercase">PAS FOTO<br/>3X4</div>}
                        </div>

                        <div className="space-y-0.5">
                          <h3 className="font-black text-xs uppercase text-slate-100 truncate max-w-full tracking-tight">{a.name}</h3>
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">{a.kontingen}</span>
                        </div>

                        <div className="w-[94%] mx-auto bg-slate-950/80 backdrop-blur-[2px] border border-slate-800 rounded-xl p-2 text-center">
                          <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">{a.kategori}</div>
                          <div className="text-[9px] font-black text-slate-200 uppercase truncate">{a.kelas.replace(/Prestasi\s*\|\s*/, "").replace(/Pemasalan\s*\|\s*/, "")}</div>
                        </div>

                        <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">ID PESERTA</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Audit Detail Side Drawer (Acts like pDetailAtletView) */}
          <AnimatePresence>
            {selectedAthlete && !isViewingIdCard && !isEditingAthlete && selectedAthlete.id !== "RECEIPT_MOCK" && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedAthlete(null)}
                  className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[2px] no-print"
                />

                {/* Audit Drawer Panel */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 220 }}
                  className="fixed top-0 right-0 bottom-0 w-[420px] max-w-full bg-white z-50 shadow-2xl p-6 overflow-y-auto border-l border-slate-100 flex flex-col justify-between no-print text-left"
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Audit Berkas Peserta</span>
                        <h4 className="font-extrabold text-red-800 text-lg uppercase leading-none mt-1">Detail Atlet</h4>
                      </div>
                      <button
                        onClick={() => setSelectedAthlete(null)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 font-bold transition-all text-xs border border-slate-200"
                      >
                        Tutup
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-3.5 bg-slate-50 p-4.5 rounded-2xl border border-slate-150 text-xs font-semibold text-slate-700">
                      <div>
                        <span className="text-slate-400 font-medium block">Nama Atlet:</span>
                        <strong className="text-slate-900 font-extrabold text-sm uppercase block mt-0.5">{selectedAthlete.name}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-3 border-t border-slate-200/50 pt-2.5">
                        <div>
                          <span className="text-slate-400 font-medium block">NIK Atlet:</span>
                          <strong className="text-slate-800 font-bold block mt-0.5">{selectedAthlete.nik}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Tanggal Lahir:</span>
                          <strong className="text-slate-800 font-bold block mt-0.5">{selectedAthlete.tglLahir}</strong>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 border-t border-slate-200/50 pt-2.5">
                        <div>
                          <span className="text-slate-400 font-medium block">Jenis Kelamin:</span>
                          <strong className="text-slate-800 font-bold block mt-0.5">{selectedAthlete.jk}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Kontingen:</span>
                          <strong className="text-red-800 font-bold block mt-0.5">{selectedAthlete.kontingen}</strong>
                        </div>
                      </div>
                      <div className="border-t border-slate-200/50 pt-2.5">
                        <span className="text-slate-400 font-medium block">Kategori & Kelas Tanding:</span>
                        <strong className="text-slate-900 font-extrabold block mt-0.5">{selectedAthlete.kategori}</strong>
                        <span className="text-[11px] text-blue-700 font-bold mt-0.5 block">
                          {selectedAthlete.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "")}
                        </span>
                      </div>
                    </div>

                    {/* Extra fields preview */}
                    {settings.customFields.length > 0 && selectedAthlete.customData && (
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Pertanyaan Tambahan:</h5>
                        <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl space-y-2 text-xs font-semibold">
                          {settings.customFields.map((f, idx) => (
                            <div key={idx} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-slate-400">{f}:</span>
                              <span className="text-slate-800 font-bold">{selectedAthlete.customData[idx] || "-"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uploaded documents thumbnail previews */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Berkas Lampiran Digital:</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {settings.photoLabels.map((lbl, idx) => {
                          const fileLink = selectedAthlete.fotos[idx];
                          return (
                            <div key={idx} className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-center flex flex-col justify-between min-h-[140px]">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide truncate max-w-full block mb-2">{lbl}</span>
                              {fileLink ? (
                                <button
                                  type="button"
                                  onClick={() => setEnlargedPhoto(fileLink)}
                                  className="block relative h-20 w-full rounded-lg overflow-hidden border border-slate-200 group bg-white cursor-pointer"
                                >
                                  <img src={fileLink} alt="Berkas" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                </button>
                              ) : (
                                <div className="h-20 w-full rounded-lg border border-dashed border-rose-200 bg-rose-50 flex items-center justify-center text-rose-500 font-black text-[9px] uppercase">
                                  Kosong
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Block depending on Role */}
                  <div className="border-t border-slate-150 pt-5 mt-6 space-y-2 shrink-0">
                    {currentUser.role === "admin" ? (
                      <>
                        <button
                          onClick={() => handleToggleAcc(selectedAthlete.id)}
                          className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-1.5 shadow-md ${
                            selectedAthlete.isAcc
                              ? "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-950/10"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/10"
                          }`}
                        >
                          {selectedAthlete.isAcc ? "❌ Batalkan Validasi ACC" : "✅ VALIDASI ACC SEKARANG"}
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSelectedAthlete(selectedAthlete);
                              setIsEditingAthlete(true);
                            }}
                            className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all text-center"
                          >
                            ✏️ Ubah Data
                          </button>
                          
                          <button
                            onClick={() => {
                              const notes = prompt("Ketik catatan penolakan / revisi untuk kontingen:");
                              if (notes) {
                                handleRejectAthlete(selectedAthlete.id, notes);
                                setSelectedAthlete(null);
                              }
                            }}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 font-extrabold text-xs py-3 rounded-xl transition-all"
                          >
                            ✍️ Tolak / Revisi
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setIsViewingIdCard(true);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all"
                          >
                            🪪 ID Card Preview
                          </button>
                          
                          <button
                            onClick={() => {
                              handleDeleteAthlete(selectedAthlete.id);
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-xl transition-all"
                          >
                            🗑️ Hapus Atlet
                          </button>
                        </div>
                      </>
                    ) : (
                      /* CONTINGENT ROLE ACTIONS */
                      <>
                        {settings.regStatus === "ON" && (
                          <button
                            onClick={() => {
                              setIsEditingAthlete(true);
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all text-center"
                          >
                            ✏️ Ubah Berkas Atlet
                          </button>
                        )}

                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Audit Receipt Detail Modal */}
          <AnimatePresence>
            {selectedAthlete && selectedAthlete.id === "RECEIPT_MOCK" && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedAthlete(null)}
                  className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[2px] no-print"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 max-w-lg w-full z-50 shadow-2xl border border-slate-100 flex flex-col gap-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bukti Transfer Rekening</span>
                      <h4 className="font-extrabold text-slate-950 text-sm uppercase mt-0.5">{selectedAthlete.name}</h4>
                    </div>
                    <button
                      onClick={() => setSelectedAthlete(null)}
                      className="text-slate-400 hover:text-slate-600 font-extrabold text-xs p-1"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                    {selectedAthlete.fotos[0] ? (
                      <img src={selectedAthlete.fotos[0]} alt="Bukti Transfer" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-slate-400 font-bold text-xs">Bukti Transfer belum diunggah.</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleUpdatePaymentStatus(
                        selectedAthlete.kontingen,
                        selectedAthlete.kelas.includes("Lunas") ? "Belum Lunas" : "Lunas"
                      );
                      setSelectedAthlete(null);
                    }}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase transition-all shadow-md ${
                      selectedAthlete.kelas.includes("Lunas")
                        ? "bg-rose-600 hover:bg-rose-500 text-white"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {selectedAthlete.kelas.includes("Lunas") ? "❌ Batalkan Status Lunas" : "✅ VERIFIKASI SEBAGAI LUNAS"}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>
      ) : (
        /* 2. AUTHENTICATION SCREENS (LOGIN & SIGNUP FOR KONTINGEN) */
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-red-800/10 blur-[120px] rounded-full pointer-events-none" />

          {activeView === "login" ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-[420px] bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative z-10 text-center space-y-6"
            >
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo Event" className="h-28 mx-auto object-contain drop-shadow-lg" />
              ) : (
                <div className="text-5xl drop-shadow-md">✊</div>
              )}

              <div>
                <h1 className="font-extrabold text-2xl lg:text-3xl tracking-tight leading-none uppercase bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                  {settings.eventTitle || "SH TERATE CUP"}
                </h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 block">
                  SISTEM PENDAFTARAN PENCAK SILAT
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      placeholder="Masukkan Username..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sandi / Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="Masukkan Password..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-xl shadow-red-950/40 tracking-wider uppercase text-center cursor-pointer"
                >
                  LOGIN MASUK SISTEM
                </button>
              </form>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/80"></div></div>
                <span className="relative bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">BELUM PUNYA AKUN?</span>
              </div>

              <button
                onClick={() => setActiveView("register_contingent")}
                className="w-full bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-all"
              >
                DAFTAR KONTINGEN BARU
              </button>

              {/* Demo shortcut block */}
              <div className="pt-4 border-t border-slate-800/40 text-center">
                <span className="text-[10px] text-slate-500 font-semibold block mb-2">Akses Cepat Pengujian:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setLoginUser("DIM");
                      setLoginPass("admin123");
                    }}
                    className="flex-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-[10px] py-2 rounded-lg border border-slate-850 cursor-pointer"
                  >
                    🛡️ Demo Admin
                  </button>
                </div>
              </div>

              {/* Emergency Contact Block */}
              <div className="pt-4 border-t border-slate-800/40 text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Hubungi Admin Jika Ada Kendala:</span>
                <a 
                  href={`https://wa.me/${settings.adminWaNumber || "6282123456789"}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs text-red-400 font-bold hover:text-red-300 transition-colors"
                >
                  <Phone size={11} />
                  <span>WA Admin:</span>
                  <span className="font-mono font-black">+{settings.adminWaNumber || "62 821-2345-6789"}</span>
                </a>
              </div>

            </motion.div>
          ) : (
            /* CONSTITUENT REGISTRATION CARD */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-[440px] bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-5"
            >
              <div className="text-center">
                <h1 className="font-extrabold text-xl tracking-tight leading-none uppercase text-red-500">
                  Buat Akun Baru
                </h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                  KONTINGEN / PADEPOKAN SILAT
                </span>
              </div>

              <form onSubmit={handleRegisterContingent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nama Penanggung Jawab / Official</label>
                  <input
                    type="text"
                    required
                    value={regPjName}
                    onChange={(e) => setRegPjName(e.target.value)}
                    placeholder="Masukkan nama PJ..."
                    className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">No. WhatsApp PJ (Aktif)</label>
                  <input
                    type="text"
                    required
                    value={regNowa}
                    onChange={(e) => setRegNowa(e.target.value)}
                    placeholder="Contoh: 08123456"
                    className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nama Kontingen / Padepokan</label>
                  <input
                    type="text"
                    required
                    value={regContingentName}
                    onChange={(e) => setRegContingentName(e.target.value)}
                    placeholder="Cth: Ranting Ponorogo..."
                    className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Username Login</label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Username..."
                      className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-600 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sandi / Password</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Password..."
                      className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-600 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all uppercase tracking-wider mt-2"
                >
                  Daftarkan Kontingen Sekarang
                </button>
              </form>

              <button
                onClick={() => setActiveView("login")}
                className="w-full bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all text-center"
              >
                Sudah Punya Akun? Login Kembali
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Photo Zoom/Enlargement Modal */}
      {enlargedPhoto && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-[4px] flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button
              onClick={() => setEnlargedPhoto(null)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all border border-white/20 hover:scale-105 cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X size={20} />
            </button>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-2 shadow-2xl max-h-[80vh] flex items-center justify-center">
              <img 
                src={enlargedPhoto} 
                alt="Enlarged Document" 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-600 py-4 text-center text-xs font-semibold border-t border-slate-900/60 no-print mt-auto">
        <p>© {new Date().getFullYear()} {settings.eventTitle || "SH TERATE CUP"}. Sistem Pendaftaran Pencak Silat Berbasis IPSI Terpadu.</p>
      </footer>

      <LoadingOverlay isLoading={isGlobalLoading} />
    </div>
  );
}
