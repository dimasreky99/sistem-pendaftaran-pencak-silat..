with open('src/components/BracketsModule.tsx', 'r') as f:
    content = f.read()

old_logic = """  const savedKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("silat_bracket_")) {
      savedKeys.push(key);
    }
  }"""

new_logic = """  const savedKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("silat_bracket_")) {
      savedKeys.push(key);
    }
  }
  
  const catOrderStr = [
    "pra usia",
    "usia dini 1",
    "usia dini 2",
    "usia dini",
    "pra remaja",
    "remaja",
    "dewasa",
    "master"
  ];
  
  savedKeys.sort((a, b) => {
    const getCatW = (cl: string) => {
      const lower = cl.toLowerCase();
      for (let j = 0; j < catOrderStr.length; j++) {
        if (lower.includes(catOrderStr[j])) return j;
      }
      return 99;
    };
    const wA = getCatW(a);
    const wB = getCatW(b);
    if (wA !== wB) return wA - wB;
    return a.localeCompare(b);
  });"""

content = content.replace(old_logic, new_logic)

with open('src/components/BracketsModule.tsx', 'w') as f:
    f.write(content)
print("Done fixing savedKeys sort")
