import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern1 = r'const waMessage = `\*UPDATE PEMBAYARAN\*\n\nHalo Kontingen \$\{c\.contingentName\},\nStatus pembayaran Anda telah diubah menjadi: \*\$\{status\}\*\.`;'
replacement1 = r'const waMessage = `*UPDATE PEMBAYARAN*\n\nHalo Kontingen ${c.contingentName},\nStatus pembayaran Anda telah diubah menjadi: *${status}*.`;'

content = re.sub(pattern1, replacement1, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
