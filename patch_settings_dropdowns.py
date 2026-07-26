import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

# Define filters
filters_code = """
  const PRESTASI_KEYS = ["Remaja", "Dewasa", "Master 1", "Master 2"];
  const PEMASALAN_KEYS = ["Pra Usia Dini", "Usia Dini 1", "Usia Dini 2", "Pra Remaja"];
  
  const getPrestasiKeys = () => Object.keys(localSettings.classData).filter(k => PRESTASI_KEYS.includes(k) || (!PRESTASI_KEYS.includes(k) && !PEMASALAN_KEYS.includes(k)));
  const getPemasalanKeys = () => Object.keys(localSettings.classData).filter(k => PEMASALAN_KEYS.includes(k));
"""

# Insert filters_code inside the component, e.g. after `const [isPemasalanOpen, setIsPemasalanOpen] = useState(false);`
hook_pattern = r'  const \[isPemasalanOpen, setIsPemasalanOpen\] = useState\(false\);'
content = re.sub(hook_pattern, hook_pattern + filters_code, content)

# Replace Object.keys(localSettings.classData) in Dropdown 1
d1_pattern = r'\{Object\.keys\(localSettings\.classData\)\s*\.map\(\(cat\) => \{'
# We have two occurrences. The first one is Dropdown 1.
content = content.replace('{Object.keys(localSettings.classData)\n                      .map((cat) => {', '{getPrestasiKeys().map((cat) => {', 1)

# The second occurrence is Dropdown 2.
content = content.replace('{Object.keys(localSettings.classData)\n                      .map((cat) => {', '{getPemasalanKeys().map((cat) => {', 1)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
