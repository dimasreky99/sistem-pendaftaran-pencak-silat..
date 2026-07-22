with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('handleTriggerSheetsSync(athletes);', 'handleTriggerSheetsSync();')

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Done fixing handleTriggerSheetsSync call")
