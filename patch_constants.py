import re

with open('src/constants.ts', 'r') as f:
    content = f.read()

# We will just inject `isPrestasi: true, isPemasalan: true,` after `active: true,`
content = content.replace('    active: true,', '    active: true,\n    isPrestasi: true,\n    isPemasalan: true,')

with open('src/constants.ts', 'w') as f:
    f.write(content)
