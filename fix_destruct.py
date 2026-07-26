import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  onAddAthleteForContingent,\n  onDeleteContingent,',
    '  onAddAthleteForContingent,\n  onImportExcelAthletes,\n  onDeleteContingent,'
)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
