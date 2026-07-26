import re

with open('src/components/UserProfile.tsx', 'r') as f:
    content = f.read()

# Completely remove all "Terima Notifikasi WA" blocks
block_pattern = r'\{currentUser\.role === "admin" && \(\s+<div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">\s+<div>\s+<h4 className="text-xs font-bold text-slate-800">Terima Notifikasi WA</h4>\s+<p className="text-\[10px\] text-slate-500 font-medium">Terima pemberitahuan saat ada pendaftaran atau aktivitas baru\.</p>\s+</div>\s+<label className="relative inline-flex items-center cursor-pointer">\s+<input type="checkbox" className="sr-only peer" checked=\{receiveNotifications\} onChange=\{\(e\) => setReceiveNotifications\(e\.target\.checked\)\} />\s+<div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-\[\'\'\] after:absolute after:top-\[2px\] after:left-\[2px\] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>\s+</label>\s+</div>\s+\)\}'
content = re.sub(block_pattern, '', content)

# Now, locate the "nowa" input and insert the block below it
nowa_div = r'(<input\s+type="text"\s+value=\{nowa\}\s+onChange=\{\(e\) => setNowa\(e\.target\.value\)\}\s+placeholder="Contoh: 08123456789"\s+className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"\s+/>\s+</div>\s+</div>)'

insertion = r"""\1
              
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
              )}"""

content = re.sub(nowa_div, insertion, content)

with open('src/components/UserProfile.tsx', 'w') as f:
    f.write(content)
