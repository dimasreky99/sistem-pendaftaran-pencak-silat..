import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_code = """              {/* Demo shortcut block */}
              <div className="pt-4 border-t border-slate-800/40 text-center">
                <span className="text-[10px] text-slate-500 font-semibold block mb-2">Akses Cepat Pengujian:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setLoginUser("user1");
                      setLoginPass("pass123");
                    }}
                    className="flex-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-[10px] py-2 rounded-lg border border-slate-850"
                  >
                    🥋 Demo Peserta
                  </button>
                </div>
              </div>"""

new_code = """              {/* Demo shortcut block */}
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
              </div>"""

content = content.replace(old_code, new_code)

with open('src/App.tsx', 'w') as f:
    f.write(content)
