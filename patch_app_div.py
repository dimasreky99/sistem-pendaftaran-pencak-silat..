import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('            /></div>', '            />')
content = content.replace('<div className="h-full"><DashboardContingent', '<DashboardContingent')

with open('src/App.tsx', 'w') as f:
    f.write(content)
