import re

with open('src/useFirebaseState.ts', 'r') as f:
    content = f.read()

content = content.replace('React.SetStateAction', 'any')

with open('src/useFirebaseState.ts', 'w') as f:
    f.write(content)
