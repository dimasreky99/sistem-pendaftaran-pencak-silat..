import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

pattern = r'(\s+\{\/\* Sekretariat Pertandingan Dropdown \*\/\})'

replacement = r'''\1
              <div className="pt-4 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setIsSekretariatOpen(!isSekretariatOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors text-left cursor-pointer"
                >
                  <span>Sekretariat Pertandingan</span>
                  {isSekretariatOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
              
              {isSekretariatOpen && (
                <div className="space-y-1.5 pl-2 transition-all pb-2">
                  {filteredSekretariatMenu.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-xs transition-all text-left ${
                          isSelected
                            ? "bg-gradient-to-r from-emerald-850 to-emerald-700 text-white shadow-md border border-emerald-800/30"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                        }`}
                      >
                        <Icon size={15} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Pengaturan & Akun */}'''

content = re.sub(pattern, replacement, content)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
