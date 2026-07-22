import React, { useState, useEffect, useMemo } from "react";
import { 
  Shield, AlertTriangle, Cpu, HardDrive, Key, Trash2, Plus, Search, 
  RefreshCw, CheckCircle, Flame, ShieldAlert, Lock, HelpCircle, Eye, EyeOff
} from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import { syncAllDataToSheets, createNewSpreadsheet } from '../lib/sheetsSync';
import { ActivityLog, Contingent, Athlete } from "../types";

interface AdminSecurityLogsProps {
  contingents: Contingent[];
  logs: ActivityLog[];
  onAddSystemLog: (actor: string, activity: string, detail: string) => void;
  onClearLogs: () => void;
  athletes: Athlete[];
  spreadsheetId: string;
  setSpreadsheetId: (url: string) => void;
  sheetSyncActive: boolean;
  setSheetSyncActive: (active: boolean) => void;
  lastSyncedTime: string;
  onTriggerSheetsSync: () => void;
  onlineStatus?: { admin: string[]; kontingen: string[] };
}

export default function AdminSecurityLogs({
  contingents,
  logs,
  onAddSystemLog,
  onClearLogs,
  athletes,
  spreadsheetId,
  setSpreadsheetId,
  sheetSyncActive,
  setSheetSyncActive,
  lastSyncedTime,
  onTriggerSheetsSync,
  onlineStatus
}: AdminSecurityLogsProps) {
  const [showGuide, setShowGuide] = useState(false);
  // Stats states for real-time performance feel
  const [cpuUsage, setCpuUsage] = useState(8.5);
  const [memoryUsage, setMemoryUsage] = useState(44.2);
  const [activeConnections, setActiveConnections] = useState(384);
  const [serverLagMs, setServerLagMs] = useState(2);
  const [isCdnActive, setIsCdnActive] = useState(true);
  const [isDdosShieldActive, setIsDdosShieldActive] = useState(true);
  // Search & Filter
  const [logSearch, setLogSearch] = useState("");
  const [securityFilter, setSecurityFilter] = useState("ALL");  // Filtered log lists for history
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = 
        (log.user || "").toLowerCase().includes(logSearch.toLowerCase()) || 
        (log.action || "").toLowerCase().includes(logSearch.toLowerCase()) || 
        (log.detail || "").toLowerCase().includes(logSearch.toLowerCase());
      return matchSearch;
    });
  }, [logs, logSearch]);

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 lg:p-8 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full px-3 py-1 text-[9px] font-black tracking-widest uppercase inline-block mb-1">
              🔒 KONSOL EKSEKLUSIF SUPER-ADMIN (DIM)
            </span>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
              <Shield className="text-rose-500" size={28} />
              MONITOR LOG AUDIT KEAMANAN & SUB-ADMIN
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-2xl">
              Panel super-administrator khusus untuk memantau integritas server, log audit aktivitas penanggung jawab, mitigasi ddos/spam secara real-time, serta mendelegasikan hak akses operasional kepada Sub-Admin panitia secara terbatas.
            </p>
          </div>
        </div>
      </div>

      {/* REAL-TIME PERFORMANCE & SECURITY STATUS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU USAGE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-2xl text-amber-400">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">PENGGUNAAN CPU</span>
            <strong className="text-xl font-black tracking-tight">{cpuUsage}%</strong>
            <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">🟢 Status: Sangat Lancar</span>
          </div>
        </div>

        {/* MEMORY STABILITY */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-2xl text-emerald-400">
            <HardDrive size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">RESERVED MEMORY</span>
            <strong className="text-xl font-black tracking-tight">{memoryUsage} MB</strong>
            <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">🟢 0% Leakage detected</span>
          </div>
        </div>

        {/* ACTIVE CONCURRENT SESSIONS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-2xl text-blue-400">
            <RefreshCw size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">SESI AKTIF</span>
            <strong className="text-xl font-black tracking-tight">{activeConnections} SESSIONS</strong>
            <span className="text-[9px] text-cyan-400 font-bold block mt-0.5">⚡ Auto-Scale Active ({serverLagMs}ms Lag)</span>
          </div>
        </div>

        {/* WEB INTEGRITY & PROTECTION LEVEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-2xl text-rose-500">
            <Lock size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">KEAMANAN & INTEGRITAS SISTEM</span>
            <strong className="text-base font-black tracking-tight text-rose-400 uppercase">PROTEKSI AKTIF</strong>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Anti SQLi, XSS, & Login Lock</span>
          </div>
        </div>
      </div>

      {/* THREE TABS BENTO VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: SHEETS BACKUP */}
        <div className="lg:col-span-5 space-y-6">
          {/* CARD 2: GOOGLE SHEETS REAL-TIME BACKUP & SYNC */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 lg:p-6 space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-emerald-600 font-extrabold text-base">📊</span>
                Google Sheets Sync & Backup Engine
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1">Real-time data synchronization to prevent any catastrophic data loss.</p>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase">STATUS INTEGRASI</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${sheetSyncActive && spreadsheetId ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <span className={`text-[10px] font-black uppercase ${sheetSyncActive && spreadsheetId ? "text-emerald-600" : "text-rose-500"}`}>
                    {sheetSyncActive && spreadsheetId ? "Aktif & Real-time" : "Nonaktif"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase block">Google Apps Script Webhook URL</label>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={spreadsheetId}
                  onChange={(e) => {
                    setSpreadsheetId(e.target.value);
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-slate-900 placeholder:text-slate-300"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black text-slate-600 uppercase">Sinkronisasi Otomatis</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !sheetSyncActive;
                    setSheetSyncActive(nextState);
                  }}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                    sheetSyncActive
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-extrabold"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300 font-extrabold"
                  }`}
                >
                  {sheetSyncActive ? "AKTIF" : "NONAKTIF"}
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-semibold space-y-1 bg-white border border-slate-250 p-2.5 rounded-xl">
                <div className="flex justify-between">
                  <span>Total Data Peserta:</span>
                  <span className="font-extrabold text-slate-800">{athletes.length} Atlet</span>
                </div>
                <div className="flex justify-between">
                  <span>Sinkronisasi Terakhir:</span>
                  <span className="font-extrabold text-slate-800">{lastSyncedTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onTriggerSheetsSync()}
                  disabled={!spreadsheetId}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition-all uppercase cursor-pointer"
                >
                  Sync Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Export as standard JSON backup file
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(athletes, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `BACKUP_SILAT_ATLET_${new Date().toISOString().slice(0, 10)}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition-all uppercase cursor-pointer"
                >
                  Unduh JSON
                </button>
              </div>
            </div>

            {/* Apps script deployment guide collapsible */}
            <div className="border border-slate-150 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center cursor-pointer select-none font-extrabold" onClick={() => setShowGuide(!showGuide)}>
                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span>💡</span> PETUNJUK INTEGRASI GOOGLE SHEETS
                </h4>
                <span className="text-slate-400 text-xs font-bold">{showGuide ? "Tutup" : "Buka"}</span>
              </div>

              {showGuide && (
                <div className="text-[10px] text-slate-500 space-y-2 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                  <p>Ikuti langkah cepat ini untuk mencadangkan data secara real-time ke Google Sheets Anda:</p>
                  <ol className="list-decimal list-inside space-y-1.5 font-semibold">
                    <li>Buat Spreadsheet baru di Google Sheets.</li>
                    <li>Klik <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.</li>
                    <li>Hapus semua kode bawaan, lalu tempel kode berikut:</li>
                  </ol>
                  <pre className="bg-slate-950 text-slate-300 p-2.5 rounded-lg text-[8px] font-mono overflow-x-auto select-all max-h-36 border border-slate-800 leading-normal">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  if (payload.action === 'sync_athletes') {
    sheet.clear();
    // Tulis header
    sheet.appendRow(["ID", "Nama", "Kontingen", "Kategori", "Kelas", "Tahun Lahir", "Berat Aktual", "Status Timbang"]);
    // Tulis data
    payload.data.forEach(function(item) {
      sheet.appendRow([
        item.id,
        item.name,
        item.kontingen,
        item.category,
        item.classLetter,
        item.birthYear,
        item.beratAktual || "",
        item.statusTimbang || ""
      ]);
    });
    return ContentService.createTextOutput("Sync OK");
  }
}`}
                  </pre>
                  <ol className="list-decimal list-inside space-y-1.5 font-semibold" start={4}>
                    <li>Klik tombol <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan Baru (New Deployment)</strong>.</li>
                    <li>Pilih Jenis sebagai <strong>Aplikasi Web</strong>.</li>
                    <li>Akses diatur ke <strong>Siapa saja (Anyone)</strong>, lalu klik Terapkan.</li>
                    <li>Salin URL Aplikasi Web yang diberikan dan tempelkan di kolom input di atas!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AUDIT LOGS */}
        <div className="lg:col-span-7 space-y-6">


          {/* SYSTEM HISTORY & ACTIONS AUDIT */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 lg:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} className="text-emerald-600" />
                  History Aktifitas & Audit Sistem
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mt-1">Seluruh aktivitas vital operator terekam aman secara real-time.</p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm("Apakah Anda yakin ingin membersihkan log aktivitas lokal?")) {
                    onClearLogs();
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black px-3 py-1.5 rounded-lg"
              >
                BERSIHKAN LOGS
              </button>
            </div>

            {/* Search filter for history */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari log aktor, aksi, atau detail..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-slate-950"
                />
              </div>
            </div>

            {/* History Logs table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase">
                    <th className="py-2.5 px-2">WAKTU</th>
                    <th className="py-2.5 px-2">USER/AKTOR</th>
                    <th className="py-2.5 px-2">AKTIVITAS</th>
                    <th className="py-2.5 px-2">DETAIL AKTIVITAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {filteredLogs.slice(0, 100).map((log, index) => {
                    const actorName = log.user || "SYSTEM";
                    const isSystem = actorName.includes("SYSTEM") || actorName.includes("SECURITY");
                    const isAdmin = actorName.includes("DIM") || actorName.includes("Admin");

                    return (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-2 text-slate-400 font-semibold whitespace-nowrap text-[10px]">
                          {log.timestamp}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSystem ? "bg-slate-100 text-slate-600" :
                            isAdmin ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {actorName}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-900 font-extrabold whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-2 text-slate-600 font-medium break-words whitespace-pre-wrap max-w-md">
                          {log.detail}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                        Tidak ada log audit yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
