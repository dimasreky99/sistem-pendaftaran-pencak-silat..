import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

# Add visibleAthletes right after getFilteredAthletesOfContingent definition
def_old = """  const getFilteredAthletesOfContingent = (name: string) => {
    return athletes.filter(a => a.kontingen === name);
  };"""
def_new = """  const getFilteredAthletesOfContingent = (name: string) => {
    return athletes.filter(a => a.kontingen === name);
  };
  
  const allContingentAthletes = selectedContingent ? getFilteredAthletesOfContingent(selectedContingent) : [];
  const visibleAthletes = allContingentAthletes.slice(0, visibleCount);
"""
content = content.replace(def_old, def_new)

# Replace mapping in table mode
map_table_old = r'getFilteredAthletesOfContingent\(selectedContingent\)\.map\(\(atlet, index\) => \{'
map_table_new = r'visibleAthletes.map((atlet, index) => {'
content = re.sub(map_table_old, map_table_new, content)

# Replace mapping in grid mode
map_grid_old = r'getFilteredAthletesOfContingent\(selectedContingent\)\.map\(\(atlet, index\) => \{'
map_grid_new = r'visibleAthletes.map((atlet, index) => {'
content = re.sub(map_grid_old, map_grid_new, content)

# Add load more button
load_more_markup = """
            {/* Load More Button */}
            {allContingentAthletes.length > visibleCount && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="bg-white border border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-full hover:bg-slate-50 transition-colors shadow-sm text-sm"
                >
                  Muat Lebih Banyak ({allContingentAthletes.length - visibleCount} lagi)
                </button>
              </div>
            )}
"""

content = content.replace('          </motion.div>\n        )}\n      </AnimatePresence>\n    </div>\n  );\n}\n', load_more_markup + '          </motion.div>\n        )}\n      </AnimatePresence>\n    </div>\n  );\n}\n')

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)

