import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('            onTriggerSheetsSync={handleTriggerSheetsSync}\n          />', '            onTriggerSheetsSync={handleTriggerSheetsSync}\n            onlineStatus={onlineStatus}\n          />')

with open('src/App.tsx', 'w') as f:
    f.write(content)
