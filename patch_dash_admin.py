import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

# Add prop
content = content.replace('  onDeleteContingent?: (contingentName: string) => void;', '  onDeleteContingent?: (contingentName: string) => void;\n  onNavigateToPayment?: () => void;')

# Add to destructuring
content = content.replace('  onAddAthleteForContingent,\n  onDeleteContingent\n}: DashboardAdminProps) => {', '  onAddAthleteForContingent,\n  onDeleteContingent,\n  onNavigateToPayment\n}: DashboardAdminProps) => {')

# Find the Belum Lunas card
old_card = """        {/* Belum Lunas */}
        {unpaidContingents > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center gap-4 shadow-sm"
          >"""

new_card = """        {/* Belum Lunas */}
        {unpaidContingents > 0 && (
          <motion.div 
            onClick={() => onNavigateToPayment && onNavigateToPayment()}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex items-center gap-4 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors"
          >"""
          
content = content.replace(old_card, new_card)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
