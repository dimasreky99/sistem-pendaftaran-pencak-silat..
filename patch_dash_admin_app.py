import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('onAddAthleteForContingent={(contingentName) => {', 'onNavigateToPayment={() => setActiveView("keuangan")}\n              onAddAthleteForContingent={(contingentName) => {')

with open('src/App.tsx', 'w') as f:
    f.write(content)
