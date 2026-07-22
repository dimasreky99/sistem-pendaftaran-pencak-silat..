import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add globalAthletePerPage state
content = content.replace('  const [globalAthletePage, setGlobalAthletePage] = useState(1);', '  const [globalAthletePage, setGlobalAthletePage] = useState(1);\n  const [globalAthletePerPage, setGlobalAthletePerPage] = useState<number | "ALL">(20);')

# Replace perPage variable
content = content.replace('        const perPage = 20;', '        const perPage = globalAthletePerPage === "ALL" ? filteredList.length || 1 : globalAthletePerPage;')

with open('src/App.tsx', 'w') as f:
    f.write(content)
