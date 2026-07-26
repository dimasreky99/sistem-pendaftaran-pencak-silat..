import re

with open('src/components/UserProfile.tsx', 'r') as f:
    content = f.read()

# Add receiveNotifications state
state_pattern = r'  const \[official2PhotoUrl, setOfficial2PhotoUrl\] = useState\(currentUser\.official2PhotoUrl \|\| ""\);'
new_state = """  const [official2PhotoUrl, setOfficial2PhotoUrl] = useState(currentUser.official2PhotoUrl || "");
  const [receiveNotifications, setReceiveNotifications] = useState(currentUser.receiveNotifications ?? true);"""
content = re.sub(state_pattern, new_state, content)

# Include receiveNotifications in onUpdateProfile
update_pattern = r'      official2PhotoUrl\n    \}\);'
new_update = """      official2PhotoUrl,
      receiveNotifications
    });"""
content = re.sub(update_pattern, new_update, content)

# Add the UI toggle inside the form, probably under 'No. WhatsApp'
wa_pattern = r'                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"\n                />\n              </div>\n            </div>'
new_wa_pattern = """                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            
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
content = re.sub(wa_pattern, new_wa_pattern, content)

with open('src/components/UserProfile.tsx', 'w') as f:
    f.write(content)
