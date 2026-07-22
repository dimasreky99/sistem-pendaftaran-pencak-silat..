with open('src/components/BracketsModule.tsx', 'r') as f:
    content = f.read()

old_sort = """  const savedClasses = useMemo(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("silat_bracket_"));
    return keys.map(k => k.substring(14)).sort();
  }, []);"""

new_sort = """  const savedClasses = useMemo(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("silat_bracket_"));
    const classes = keys.map(k => k.substring(14));
    
    const catOrder = [
      "pra usia",
      "usia dini 1",
      "usia dini 2",
      "usia dini",
      "pra remaja",
      "remaja",
      "dewasa",
      "master"
    ];
    
    const getCatWeight = (cl: string) => {
      const lower = cl.toLowerCase();
      for (let i = 0; i < catOrder.length; i++) {
        if (lower.includes(catOrder[i])) return i;
      }
      return 99;
    };
    
    return classes.sort((a, b) => {
      const wA = getCatWeight(a);
      const wB = getCatWeight(b);
      if (wA !== wB) return wA - wB;
      return a.localeCompare(b);
    });
  }, []);"""

content = content.replace(old_sort, new_sort)

with open('src/components/BracketsModule.tsx', 'w') as f:
    f.write(content)
print("Done fixing sort")
