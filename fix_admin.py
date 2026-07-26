with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

# I need to restore the deleted lines. Let me see what I deleted.
# I deleted lines 343-346.
# I can just replace the broken part with the correct one.
# The broken part is:
'''        </motion.div>
      </div>
      
          <span className="text-slate-300 text-sm font-semibold">Tindakan Sistem:</span>
        </div>
        <div className="flex gap-2">'''

# I will replace it with:
'''        </motion.div>
      </div>
      
      <div className="flex items-center justify-end mb-6 bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-800">
        <div className="flex gap-2">'''

content = content.replace('''        </motion.div>
      </div>
      
          <span className="text-slate-300 text-sm font-semibold">Tindakan Sistem:</span>
        </div>
        <div className="flex gap-2">''', '''        </motion.div>
      </div>
      
      <div className="flex items-center justify-end mb-6 bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-800">
        <div className="flex gap-2">''')

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
