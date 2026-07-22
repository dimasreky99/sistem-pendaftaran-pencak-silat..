import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = 'import { generateDummyAthletes } from "../dummy";\n'
if import_stmt not in content:
    content = content.replace('import { SystemSettings, CategoryConfig } from "../types";', 'import { SystemSettings, CategoryConfig } from "../types";\n' + import_stmt)

# Uncomment
content = content.replace('/* await generateDummyAthletes(formData, 10); */', 'await generateDummyAthletes(formData, 2);')

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
