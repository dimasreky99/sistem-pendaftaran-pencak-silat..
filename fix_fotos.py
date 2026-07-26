import re

files_to_fix = [
    'src/App.tsx',
    'src/components/DashboardAdmin.tsx',
    'src/components/IdCardPreview.tsx'
]

for file in files_to_fix:
    with open(file, 'r') as f:
        content = f.read()
        
    content = content.replace('a.fotos[0]', 'a.fotos?.[0]')
    content = content.replace('atlet.fotos[0]', 'atlet.fotos?.[0]')
    content = content.replace('selectedAthlete.fotos[0]', 'selectedAthlete.fotos?.[0]')
    content = content.replace('tgt.fotos[0]', 'tgt.fotos?.[0]')
    
    with open(file, 'w') as f:
        f.write(content)
