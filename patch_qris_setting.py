import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

old_code = """                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none leading-relaxed"
                  />
                  <div className="mt-3 space-y-3">
                                        <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">No. Awal Invoice (Prefix Angka)</label>"""

new_code = """                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 focus:outline-none leading-relaxed"
                  />
                  
                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Gambar QRIS (Opsional)</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");
                                let w = img.width;
                                let h = img.height;
                                const max_size = 1200; // QR code needs good resolution
                                if (w > h) {
                                  if (w > max_size) { h *= max_size / w; w = max_size; }
                                } else {
                                  if (h > max_size) { w *= max_size / h; h = max_size; }
                                }
                                canvas.width = w;
                                canvas.height = h;
                                ctx?.drawImage(img, 0, 0, w, h);
                                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                                handleUpdateBasic("qrisPhotoUrl", compressedBase64);
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs w-full sm:w-auto"
                      />
                      {localSettings.qrisPhotoUrl && (
                        <div className="relative">
                          <img src={localSettings.qrisPhotoUrl} alt="QRIS" className="w-24 rounded-lg border shadow-sm" />
                          <button
                            type="button"
                            onClick={() => handleUpdateBasic("qrisPhotoUrl", "")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                                        <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">No. Awal Invoice (Prefix Angka)</label>"""

content = content.replace(old_code, new_code)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
