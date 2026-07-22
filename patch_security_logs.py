import re

with open('src/components/AdminSecurityLogs.tsx', 'r') as f:
    content = f.read()

# Update Props
old_props = """  lastSyncedTime: string;
  onTriggerSheetsSync: () => void;
}"""

new_props = """  lastSyncedTime: string;
  onTriggerSheetsSync: () => void;
  onlineStatus?: { admin: string[]; kontingen: string[] };
}"""

content = content.replace(old_props, new_props)

old_args = """  lastSyncedTime,
  onTriggerSheetsSync
}: AdminSecurityLogsProps) {"""

new_args = """  lastSyncedTime,
  onTriggerSheetsSync,
  onlineStatus
}: AdminSecurityLogsProps) {"""

content = content.replace(old_args, new_args)

# Add online status block
old_stats = """          {/* LIVE SYSTEM STATS */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 lg:p-6 text-white space-y-5 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">"""

new_stats = """          {/* ONLINE STATUS */}
          {onlineStatus && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 lg:p-6 text-white space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Activity size={18} className="text-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
                  Real-time Online Status
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Admin Online</span>
                  <div className="flex flex-wrap gap-1.5">
                    {onlineStatus.admin.length > 0 ? onlineStatus.admin.map((adm, i) => (
                      <span key={i} className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {adm}
                      </span>
                    )) : <span className="text-xs text-slate-600 font-medium">-</span>}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Kontingen Online</span>
                  <div className="flex flex-wrap gap-1.5">
                    {onlineStatus.kontingen.length > 0 ? onlineStatus.kontingen.map((kont, i) => (
                      <span key={i} className="bg-sky-950/40 border border-sky-900/50 text-sky-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span> {kont}
                      </span>
                    )) : <span className="text-xs text-slate-600 font-medium">-</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE SYSTEM STATS */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 lg:p-6 text-white space-y-5 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">"""

content = content.replace(old_stats, new_stats)

with open('src/components/AdminSecurityLogs.tsx', 'w') as f:
    f.write(content)
