with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

import re

# Insert the handleDownloadBackup method.
old_import = "export default function SystemSettingsComponent({"
new_import = """export default function SystemSettingsComponent({"""
if "handleDownloadBackup" not in content:
    func_code = """
  const handleDownloadBackup = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("silat_")) {
        const val = localStorage.getItem(key);
        try {
          backupData[key] = JSON.parse(val || "{}");
        } catch {
          backupData[key] = val;
        }
      }
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_silat_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if(setToast) setToast({ message: "Backup data berhasil diunduh", type: "success" });
  };
"""
    content = content.replace("export default function SystemSettingsComponent({", func_code + "\nexport default function SystemSettingsComponent({")

old_btn = """        <div className="flex flex-wrap gap-3.5">
          <button
            onClick={onResetSystem}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-rose-950/20 uppercase"
          >
            🚨 ARSIPKAN & BUAT TURNAMEN BARU
          </button>
        </div>"""

new_btn = """        <div className="flex flex-wrap gap-3.5">
          <button
            onClick={handleDownloadBackup}
            className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md uppercase"
          >
            💾 UNDUH BACKUP DATA
          </button>
          <button
            onClick={onResetSystem}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-rose-950/20 uppercase"
          >
            🚨 ARSIPKAN & BUAT TURNAMEN BARU
          </button>
        </div>"""

content = content.replace(old_btn, new_btn)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
print("Done fix backup btn")
