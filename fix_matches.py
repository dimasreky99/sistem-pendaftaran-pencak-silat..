import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'(export const recalculateBracketWinners = \(bracketData: any, athletesList: Athlete\[\]\) => \{)'
replacement = r'\1\n  if (!bracketData || !bracketData.matches) return bracketData;'

content = re.sub(pattern, replacement, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
