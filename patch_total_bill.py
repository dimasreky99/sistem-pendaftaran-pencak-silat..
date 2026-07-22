import re

files = [
    'src/components/DashboardContingent.tsx',
    'src/components/AdminPaymentManagement.tsx',
    'src/App.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    content = content.replace('subtotal + contingent.kodeUnik', 'subtotal')
    content = content.replace('subtotal + (contingent.kodeUnik || 0)', 'subtotal')

    with open(file, 'w') as f:
        f.write(content)
