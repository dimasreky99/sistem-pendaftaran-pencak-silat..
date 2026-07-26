import re

with open('src/components/AdminPaymentManagement.tsx', 'r') as f:
    content = f.read()

# Add qris file handler state and upload logic
hook_old = """  const [isPreviewReportOpen, setIsPreviewReportOpen] = useState(false);

  // Helper formatting currency"""

hook_new = """  const [isPreviewReportOpen, setIsPreviewReportOpen] = useState(false);
  const [qrisUploading, setQrisUploading] = useState(false);

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 2MB.");
      return;
    }

    setQrisUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (onUpdateSettings) {
        onUpdateSettings({ ...settings, qrisPhotoUrl: base64String });
      } else {
        alert("Fungsi update setting tidak tersedia.");
      }
      setQrisUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQris = () => {
    if (confirm("Hapus QRIS saat ini?")) {
      if (onUpdateSettings) {
        onUpdateSettings({ ...settings, qrisPhotoUrl: "" });
      }
    }
  };

  // Helper formatting currency"""

content = content.replace(hook_old, hook_new)

# Add QRIS component
qris_section = """      {/* QRIS MANAGEMENT SECTION */}
      {!isPreviewReportOpen && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print:hidden">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                Manajemen QRIS Pembayaran
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                Unggah foto QRIS di sini agar kontingen dapat langsung melakukan pemindaian (scan) untuk melunasi pembayaran pendaftaran mereka. QRIS akan otomatis muncul di Dashboard Kontingen bagi kontingen yang statusnya "Belum Lunas".
              </p>
              
              <div className="flex items-center gap-3">
                <label className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm">
                  {qrisUploading ? "Mengunggah..." : (settings.qrisPhotoUrl ? "Ganti Foto QRIS" : "Unggah QRIS")}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleQrisUpload}
                    disabled={qrisUploading}
                  />
                </label>
                {settings.qrisPhotoUrl && (
                  <button
                    onClick={handleRemoveQris}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
            {settings.qrisPhotoUrl && (
              <div className="w-full md:w-32 h-32 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 shadow-inner p-2 relative group">
                <img src={settings.qrisPhotoUrl} alt="QRIS" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>
      )}"""

# Insert it before SEARCH & FILTERS CONTROLS
target = "{/* SEARCH & FILTERS CONTROLS (Hidden on Print) */}"
content = content.replace(target, qris_section + "\n\n      " + target)

with open('src/components/AdminPaymentManagement.tsx', 'w') as f:
    f.write(content)

