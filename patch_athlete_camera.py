import re

with open('src/components/AthleteForm.tsx', 'r') as f:
    content = f.read()

old_code = """                    <div className="flex items-center gap-3">
                      {/* Upload Button */}
                      <div className="relative overflow-hidden inline-block shrink-0">
                        <button
                          type="button"
                          className="bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          {hasFile ? "🔄 Ganti File" : "📎 Pilih File"}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          required={!hasFile}
                          capture="environment"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(idx, e.target.files[0]);
                            }
                          }}
                          className="absolute left-0 top-0 opacity-0 scale-150 cursor-pointer w-full h-full"
                        />
                      </div>
                      {/* File Preview */}"""

new_code = """                    <div className="flex flex-wrap items-center gap-2">
                      {/* Upload Button */}
                      <div className="relative overflow-hidden inline-block shrink-0">
                        <button
                          type="button"
                          className="bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm"
                        >
                          {hasFile ? "🔄 Ganti" : "📎 File"}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(idx, e.target.files[0]);
                            }
                          }}
                          className="absolute left-0 top-0 opacity-0 scale-150 cursor-pointer w-full h-full"
                        />
                      </div>
                      {/* Camera Button */}
                      <div className="relative overflow-hidden inline-block shrink-0">
                        <button
                          type="button"
                          className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1"
                        >
                          📷 Kamera
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(idx, e.target.files[0]);
                            }
                          }}
                          className="absolute left-0 top-0 opacity-0 scale-150 cursor-pointer w-full h-full"
                        />
                      </div>
                      {/* File Preview */}"""

content = content.replace(old_code, new_code)

with open('src/components/AthleteForm.tsx', 'w') as f:
    f.write(content)
