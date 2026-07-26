import re

with open('src/components/PembayaranContingentView.tsx', 'r') as f:
    content = f.read()

# Edit the Upload Bukti Pembayaran section
old_section = """              {contingent.paymentStatus === "Lunas" ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200">
                  <CheckCircle size={40} className="text-emerald-500 mb-2.5" />
                  <h4 className="font-bold text-emerald-800 text-sm">Pembayaran Terkonfirmasi</h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-semibold max-w-[200px]">
                    ID Card seluruh atlet Anda sekarang bebas diunduh dan dicetak!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {contingent.buktiTransferUrl ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={contingent.buktiTransferUrl}
                        alt="Bukti Transfer"
                        className="w-full aspect-[4/3] object-contain"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <p className="text-white font-bold text-xs uppercase tracking-wider">Menunggu Validasi Panitia</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center text-slate-400 transition-all hover:bg-slate-100 hover:border-slate-300">
                      <UploadCloud size={32} className="mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600 mb-1">Unggah Bukti (JPG/PNG)</p>
                      <p className="text-[10px] font-semibold text-slate-400 max-w-[150px] leading-relaxed">
                        Jika sudah transfer, lampirkan resi/struk di sini.
                      </p>
                    </div>
                  )}

                  <label className="w-full relative">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <div className={`w-full text-center font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-sm cursor-pointer ${
                      isUploading 
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                    }`}>
                      {isUploading ? "MENGUNGGAH..." : (contingent.buktiTransferUrl ? "UNGGAH ULANG BUKTI" : "PILIH FILE BUKTI")}
                    </div>
                  </label>
                </div>
              )}"""

new_section = """              {contingent.paymentStatus === "Lunas" ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200">
                  <CheckCircle size={40} className="text-emerald-500 mb-2.5" />
                  <h4 className="font-bold text-emerald-800 text-sm">Pembayaran Terkonfirmasi</h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-semibold max-w-[200px]">
                    ID Card seluruh atlet Anda sekarang bebas diunduh dan dicetak!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {settings.qrisPhotoUrl && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center flex flex-col items-center shadow-inner">
                      <h4 className="font-black text-emerald-900 text-xs uppercase tracking-wider mb-2">Scan QRIS Pembayaran</h4>
                      <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-sm">
                        <img src={settings.qrisPhotoUrl} alt="QRIS" className="w-40 h-40 object-contain mx-auto" />
                      </div>
                      <p className="text-[10px] text-emerald-700 font-semibold mt-2">
                        Gunakan aplikasi perbankan atau e-wallet untuk scan dan membayar tagihan pendaftaran.
                      </p>
                    </div>
                  )}

                  {contingent.buktiTransferUrl ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={contingent.buktiTransferUrl}
                        alt="Bukti Transfer"
                        className="w-full aspect-[4/3] object-contain"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <p className="text-white font-bold text-xs uppercase tracking-wider">Menunggu Validasi Panitia</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center text-slate-400 transition-all hover:bg-slate-100 hover:border-slate-300">
                      <UploadCloud size={32} className="mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600 mb-1">Unggah Bukti (JPG/PNG)</p>
                      <p className="text-[10px] font-semibold text-slate-400 max-w-[150px] leading-relaxed">
                        Jika sudah transfer, lampirkan resi/struk di sini.
                      </p>
                    </div>
                  )}

                  <label className="w-full relative">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <div className={`w-full text-center font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-sm cursor-pointer ${
                      isUploading 
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                    }`}>
                      {isUploading ? "MENGUNGGAH..." : (contingent.buktiTransferUrl ? "UNGGAH ULANG BUKTI" : "PILIH FILE BUKTI")}
                    </div>
                  </label>
                </div>
              )}"""

content = content.replace(old_section, new_section)

with open('src/components/PembayaranContingentView.tsx', 'w') as f:
    f.write(content)

