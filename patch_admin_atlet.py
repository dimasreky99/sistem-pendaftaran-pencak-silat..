import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

# Props update
content = content.replace('  onNavigateToPayment?: () => void;', '  onNavigateToPayment?: () => void;\n  onNavigateToAthletes?: () => void;')
content = content.replace('  onNavigateToPayment\n}: DashboardAdminProps) => {', '  onNavigateToPayment,\n  onNavigateToAthletes\n}: DashboardAdminProps) => {')

# Find the Total Atlet card
old_code = """        {/* Total Atlet with Quick Add Plus button */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center justify-between gap-4 shadow-sm relative overflow-visible"
        >"""

new_code = """        {/* Total Atlet with Quick Add Plus button */}
        <motion.div 
          onClick={() => onNavigateToAthletes && onNavigateToAthletes()}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center justify-between gap-4 shadow-sm relative overflow-visible cursor-pointer hover:bg-slate-800 transition-colors"
        >"""

content = content.replace(old_code, new_code)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
