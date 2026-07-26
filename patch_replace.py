import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = 'const waMessage = `*STATUS VALIDASI ATLET*\nHalo Kontingen ${a.kontingen},\nStatus berkas atlet atas nama *${a.name}* telah diubah menjadi: *${statusText}*.`;'
replacement = 'const waMessage = `*STATUS VALIDASI ATLET*\\n\\nHalo Kontingen ${a.kontingen},\\nStatus berkas atlet atas nama *${a.name}* telah diubah menjadi: *${statusText}*.`;'

if target in content:
    content = content.replace(target, replacement)
else:
    print("Not found")

with open('src/App.tsx', 'w') as f:
    f.write(content)
