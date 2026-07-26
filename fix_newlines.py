import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'const waMessage = `\*STATUS VALIDASI ATLET\*\nHalo Kontingen \$\{a\.kontingen\},\nStatus berkas atlet atas nama \*\$\{a\.name\}\* telah diubah menjadi: \*\$\{statusText\}\*\.`;'
replacement = r'''const waMessage = `*STATUS VALIDASI ATLET*\n\nHalo Kontingen ${a.kontingen},\nStatus berkas atlet atas nama *${a.name}* telah diubah menjadi: *${statusText}*.`;'''

content = re.sub(pattern, replacement, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
