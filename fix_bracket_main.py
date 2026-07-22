import re

with open('src/components/BracketsModule.tsx', 'r') as f:
    content = f.read()

# I want to replace the !selectedClass grid with a read-only rendering of all brackets

old_ui = r'\{!selectedClass && savedClasses\.length > 0 && \(\s*<div className="mt-8 animate-fade-in pb-12">.*?</div>\s*</div>\s*\)\}'

new_ui = """{!selectedClass && savedClasses.length > 0 && (
            <div className="mt-8 animate-fade-in pb-12 space-y-12">
              <div className="text-center pb-6 border-b border-slate-200 mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase">Seluruh Bagan Tersimpan</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Gunakan menu dropdown di atas untuk memilih kelas dan masuk ke Mode Edit/Penilaian.</p>
              </div>
              
              {savedClasses.map((cl) => {
                let bracketData: { matches: Record<number, any[]>; roundsCount: number; winner: any | null } | null = null;
                try {
                  bracketData = JSON.parse(localStorage.getItem("silat_bracket_" + cl) || "");
                } catch (e) {
                  return null;
                }
                if (!bracketData || !bracketData.matches) return null;
                
                const r1C = bracketData.matches[1]?.length || 2;
                const containerHeight = Math.max(480, r1C * 120);
                const roundsCount = bracketData.roundsCount;
                
                return (
                  <div key={cl} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto w-full">
                    <div className="text-center mb-6 border-b-2 border-slate-900 pb-4 min-w-max">
                      <h1 className="text-xl font-black text-slate-950 uppercase">{cl}</h1>
                      <h2 className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                        SISTEM BRACKET BAGAN PERTANDINGAN RESMI - SILAT TOURNAMENT
                      </h2>
                    </div>
                    
                    <div className="flex gap-8 items-stretch py-4 min-w-max" style={{ height: `${containerHeight}px` }}>
                      {Array.from({ length: roundsCount }).map((_, rIdx) => {
                        const roundNum = rIdx + 1;
                        const roundMatches = bracketData!.matches[roundNum] || [];
                        const isLastRound = roundNum === roundsCount;
                        const verticalStemHeight = containerHeight / (roundMatches.length * 2);
                        
                        return (
                          <div key={roundNum} className="flex flex-col relative" style={{ width: "220px" }}>
                            <div className="text-center font-black text-[10px] text-emerald-800 uppercase tracking-widest bg-emerald-50 py-1 rounded-lg border border-emerald-100 mb-2">
                              {roundNum === roundsCount ? "Final" : `Babak ${roundNum}`}
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-around h-full">
                              {roundMatches.map((match, mIdx) => {
                                const isByeMatch = roundNum === 1 && (match.p1?.isBye || match.p2?.isBye);
                                return (
                                  <div key={match.matchIndex} className="relative flex items-center justify-end" style={{ height: `${verticalStemHeight * 2}px` }}>
                                    <div className="flex flex-col w-full z-10 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-xs absolute right-0">
                                      <div className={`p-2 border-l-2 border-l-blue-600 flex justify-between items-center ${
                                        match.winner && match.winner.nama !== match.p1?.nama ? "opacity-30 bg-slate-50" : "bg-blue-50/5"
                                      }`}>
                                        <div className="truncate pr-2">
                                          <span className="font-black text-[10px] uppercase block truncate text-blue-950">
                                            {match.p1 ? (match.p1.isBye ? "BYE" : match.p1.nama) : "???"}
                                          </span>
                                          <span className="text-[8px] text-blue-800/70 font-semibold block truncate">
                                            {match.p1?.kontingen || "-"}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className={`p-2 border-l-2 border-l-rose-600 flex justify-between items-center ${
                                        match.winner && match.winner.nama !== match.p2?.nama ? "opacity-30 bg-slate-50" : "bg-rose-50/5"
                                      }`}>
                                        <div className="truncate pr-2">
                                          <span className="font-black text-[10px] uppercase block truncate text-rose-950">
                                            {match.p2 ? (match.p2.isBye ? "BYE" : match.p2.nama) : "???"}
                                          </span>
                                          <span className="text-[8px] text-rose-800/70 font-semibold block truncate">
                                            {match.p2?.kontingen || "-"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {!isLastRound && (
                                      <>
                                        <div className="absolute right-[-16px] top-1/2 w-[16px] h-0 border-t-2 border-slate-300 z-0"></div>
                                        <div 
                                          className="absolute right-[-16px] w-0 border-l-2 border-slate-300 z-0"
                                          style={mIdx % 2 === 0 
                                            ? { top: "50%", height: `${verticalStemHeight}px` } 
                                            : { bottom: "50%", height: `${verticalStemHeight}px` }
                                          }
                                        ></div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="flex flex-col justify-center pl-8" style={{ width: "200px" }}>
                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center space-y-2 shadow-sm relative">
                          <div className="absolute -left-[32px] top-1/2 w-[32px] h-0 border-t-2 border-slate-300 z-0"></div>
                          <div className="text-amber-800 font-black text-[10px] uppercase tracking-widest border-b border-amber-200 pb-2">
                            🏆 Juara Kelas
                          </div>
                          {bracketData.winner ? (
                            <div>
                              <h4 className="font-black text-sm text-amber-950 uppercase leading-tight">
                                {bracketData.winner.nama}
                              </h4>
                              <p className="text-[10px] text-amber-700 font-bold mt-1">
                                {bracketData.winner.kontingen}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold block py-2">
                              Menunggu...
                            </span>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          )}"""

content = re.sub(old_ui, new_ui, content, flags=re.DOTALL)

with open('src/components/BracketsModule.tsx', 'w') as f:
    f.write(content)
print("Done Brackets")
