import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

new_wa_block = """      {/* Section: API Notifikasi WhatsApp */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
          Integrasi API WhatsApp
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">URL Endpoint API (mis. Fonnte / Wablas)</label>
            <input
              type="text"
              value={localSettings.waApiUrl || ""}
              onChange={(e) => setLocalSettings({...localSettings, waApiUrl: e.target.value})}
              placeholder="https://api.fonnte.com/send"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">API Token / API Key</label>
            <input
              type="text"
              value={localSettings.waApiKey || ""}
              onChange={(e) => setLocalSettings({...localSettings, waApiKey: e.target.value})}
              placeholder="YOUR_API_TOKEN"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">Kosongkan jika Anda tidak menggunakan notifikasi WA otomatis. Payload API mengikuti format Fonnte (POST, Authorization header, JSON body: target, message).</p>
      </div>

      {/* DANGEROUS DISASTER"""

content = content.replace("      {/* DANGEROUS DISASTER", new_wa_block)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
