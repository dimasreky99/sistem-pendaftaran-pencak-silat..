import re

with open('src/components/UserProfile.tsx', 'r') as f:
    content = f.read()

# First, remove all occurrences of the bad pattern
bad_pattern = r'            \{currentUser\.role === "admin" && \(\n              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">\n                <div>\n                  <h4 className="text-xs font-bold text-slate-800">Terima Notifikasi WA</h4>\n                  <p className="text-\[10px\] text-slate-500 font-medium">Terima pemberitahuan saat ada pendaftaran atau aktivitas baru\.</p>\n                </div>\n                <label className="relative inline-flex items-center cursor-pointer">\n                  <input type="checkbox" className="sr-only peer" checked=\{receiveNotifications\} onChange=\{\(e\) => setReceiveNotifications\(e\.target\.checked\)\} />\n                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-\[\'\'\] after:absolute after:top-\[2px\] after:left-\[2px\] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>\n                </label>\n              </div>\n            \)\}\n\n'

content = re.sub(bad_pattern, '', content)

# Now, insert it after the nowa div
nowa_pattern = r'              </div>\n\n              \{currentUser\.role !== "admin" && \('
new_nowa = """              </div>

              {currentUser.role === "admin" && (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Terima Notifikasi WA</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Terima pemberitahuan saat ada pendaftaran atau aktivitas baru.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={receiveNotifications} onChange={(e) => setReceiveNotifications(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              )}

              {currentUser.role !== "admin" && ("""

content = re.sub(nowa_pattern, new_nowa, content)

with open('src/components/UserProfile.tsx', 'w') as f:
    f.write(content)
