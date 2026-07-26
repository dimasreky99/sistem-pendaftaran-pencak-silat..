import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

pattern = r'              \{/\* Sekretariat Pertandingan Dropdown \*/\}.*?\{/\* Active Users Block \*/\}'

new_block = """              {/* Sekretariat Pertandingan Dropdown */}
              {userRole === "admin" && (
                <>
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
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t border-slate-800/40">
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
            </div>

            {/* Active Users Block */}"""

content = re.sub(pattern, new_block, content, flags=re.DOTALL)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
