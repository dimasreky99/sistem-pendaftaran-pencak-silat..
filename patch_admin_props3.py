import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

pattern = r'  onNavigateToAthletes(.*?)\}: DashboardAdminProps\) \{'
new_code = r'  onNavigateToAthletes,\n  onPrintLaporan\n}: DashboardAdminProps) {'

content = re.sub(pattern, new_code, content, flags=re.DOTALL)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
