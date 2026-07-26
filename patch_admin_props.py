import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

pattern_props = r'  onAddContingent\?: \(c: Contingent\) => void;'
new_props = """  onAddContingent?: (c: Contingent) => void;
  onPrintLaporan: () => void;"""
content = re.sub(pattern_props, new_props, content)

pattern_destruct = r'  onAddContingent,\s+\}: DashboardAdminProps\)'
new_destruct = """  onAddContingent,
  onPrintLaporan
}: DashboardAdminProps)"""
content = re.sub(pattern_destruct, new_destruct, content)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
