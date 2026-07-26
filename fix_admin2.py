import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

pattern = r'</motion\.div>\s*</div>\s*<span.*?Tindakan Sistem:</span>\s*</div>\s*<div className="flex gap-2">'
replacement = '''</motion.div>
      </div>

      <div className="flex items-center justify-end mb-6 bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-800">
        <div className="flex gap-2">'''

content = re.sub(pattern, replacement, content)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
