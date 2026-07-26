import re

with open('src/components/DashboardContingent.tsx', 'r') as f:
    content = f.read()

pattern = r'\s*\{/\* Rekap Kelas \*/\}.*?\{/\* Athletes Header Actions \*/\}'

new_block = "\n\n      {/* Athletes Header Actions */}"

content = re.sub(pattern, new_block, content, flags=re.DOTALL)

with open('src/components/DashboardContingent.tsx', 'w') as f:
    f.write(content)
