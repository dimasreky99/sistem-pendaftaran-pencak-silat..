import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

# I will add an "Arsip & Reset Turnamen" section.
# Let's insert it before the closing `</div>` of the main view.
# To find the insertion point, let's search for "Simpan Pengaturan".

btn_pattern = r'(\s*<div className="flex justify-end pt-6 border-t border-slate-200">\s*<button\s*onClick=\{handleSave\})'

archive_section = """
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm mt-8">
          <h3 className="font-extrabold text-rose-800 text-lg uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Arsip & Reset Turnamen
          </h3>
          <p className="text-sm font-semibold text-slate-600 mb-6">
            Fitur ini akan mengunduh seluruh data (Kontingen dan Atlet) menjadi file Excel, kemudian <strong className="text-rose-600">menghapus secara permanen</strong> data tersebut dari database untuk memulai turnamen baru. Pengaturan sistem tidak akan dihapus.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input 
              type="password" 
              id="masterPasswordInput"
              placeholder="Masukkan Password Master Admin..." 
              className="flex-1 w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl font-bold text-sm text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <button 
              type="button"
              onClick={() => {
                const pwdInput = document.getElementById('masterPasswordInput') as HTMLInputElement;
                if (!pwdInput || pwdInput.value !== 'DIM') {
                  alert('Password Master Admin salah!');
                  return;
                }
                
                if (window.confirm("PERINGATAN KERAS: Semua data atlet dan kontingen akan DIBERSIHKAN setelah diunduh. Lanjutkan?")) {
                  // Trigger custom event or call a prop if passed, but since we are in SystemSettings we might not have direct access to reset DB.
                  // We can emit a custom event to App.tsx
                  const event = new CustomEvent('archive-and-reset-db');
                  window.dispatchEvent(event);
                  pwdInput.value = '';
                }
              }}
              className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shrink-0 uppercase tracking-wider"
            >
              📥 Arsipkan & Reset
            </button>
          </div>
        </div>
"""

content = re.sub(btn_pattern, archive_section + r'\1', content)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
