import re

with open('src/components/AthleteForm.tsx', 'r') as f:
    content = f.read()

# Replace the useState for matchType to use settings.matchType if available
old_init = r'  const \[matchType, setMatchType\] = useState<"Prestasi" \| "Pemasalan">\("Prestasi"\);'
new_init = r'  const [matchType, setMatchType] = useState<"Prestasi" | "Pemasalan">(settings.matchType === "Pemasalan" ? "Pemasalan" : "Prestasi");'
content = re.sub(old_init, new_init, content)

with open('src/components/AthleteForm.tsx', 'w') as f:
    f.write(content)
