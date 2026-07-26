import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'            \{/\* If printing bulk \*/\}\s+\{bulkIdCardsTargets\.length > 0 && \('
new_code = """            {/* If printing bulk */}
            {!isPrintingLaporan && bulkIdCardsTargets.length > 0 && ("""

content = re.sub(pattern, new_code, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
