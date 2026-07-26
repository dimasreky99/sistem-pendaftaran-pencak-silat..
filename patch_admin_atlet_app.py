import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('onNavigateToPayment={() => setActiveView("keuangan")}', 'onNavigateToPayment={() => setActiveView("kelola-pembayaran")}\n              onNavigateToAthletes={() => setActiveView("atlet-seluruh")}')

with open('src/App.tsx', 'w') as f:
    f.write(content)
