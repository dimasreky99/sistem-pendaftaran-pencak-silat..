import re
with open('src/App.tsx', 'r') as f:
    content = f.read()
content = content.replace('admin: ["DIM"],\n    kontingen: ["Cabang Ponorogo", "Puslatcab Ngawi"]', 'admin: [],\n    kontingen: []')
with open('src/App.tsx', 'w') as f:
    f.write(content)
