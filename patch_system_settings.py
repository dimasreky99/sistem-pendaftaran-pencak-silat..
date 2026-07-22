import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

content = content.replace('await generateDummyAthletes(formData, 10);', '/* await generateDummyAthletes(formData, 10); */')
content = content.replace('// generateDummyAthletes(formData);', '/* generateDummyAthletes */')

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
