import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

old_code = """        {/* Belum Lunas */}
        {!settings.isFree && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center gap-4 shadow-sm"
          >"""

new_code = """        {/* Belum Lunas */}
        {!settings.isFree && (
          <motion.div 
            onClick={() => onNavigateToPayment && onNavigateToPayment()}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center gap-4 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors"
          >"""

content = content.replace(old_code, new_code)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
