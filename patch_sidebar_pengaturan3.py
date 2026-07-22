import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Make sure isPengaturanOpen is added if not present
if "const [isPengaturanOpen" not in content:
    content = content.replace('  const [isSekretariatOpen, setIsSekretariatOpen] = React.useState(false);', '  const [isSekretariatOpen, setIsSekretariatOpen] = React.useState(false);\n  const [isPengaturanOpen, setIsPengaturanOpen] = React.useState(false);')

old_code = """              <div className="pt-6 px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800/40">
                Pengaturan & Akun
              </div>
              {userRole === "admin" && (
                <>
                  {username === "DIM" && (
                    <>
                      <button
                        onClick={() => {
                          onNavigate("kelola-admin");
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all text-left ${
                          activeView === "kelola-admin"
                            ? "bg-gradient-to-r from-emerald-850 to-emerald-700 text-white shadow-md border border-emerald-800/30"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                        }`}
                      >
                        <User size={18} />
                        Manajemen Akun
                      </button>
                      <button
                        onClick={() => {
                          onNavigate("security-logs");
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all text-left ${
                          activeView === "security-logs"
                            ? "bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white shadow-md shadow-rose-950/20 border border-rose-900/30"
                            : "text-rose-400 hover:bg-slate-800/60"
                        }`}
                      >
                        <Shield size={18} />
                        Security & Logs Monitor
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      onNavigate("settings");
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all text-left ${
                      activeView === "settings"
                        ? "bg-gradient-to-r from-slate-800 to-slate-700 text-white"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                    }`}
                  >
                    <Settings size={18} />
                    Pengaturan Sistem
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all text-left"
              >
                <LogOut size={18} />
                Keluar Aplikasi
              </button>"""

new_code = """              <div className="pt-4 border-t border-slate-800/40">
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
              )}"""

if old_code in content:
    content = content.replace(old_code, new_code)
else:
    print("Could not find old code in Sidebar.tsx")

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
