import re

with open('src/components/AthleteForm.tsx', 'r') as f:
    content = f.read()

# Replace the categorize logic
old_logic = r'      const PRESTASI_KEYS = \["Remaja", "Dewasa", "Master 1", "Master 2"\];.*?      if \(!matchedCategory\) \{'
new_logic = """      const allowedKeys = Object.keys(settings.classData).filter(cat => {
        const conf = settings.classData[cat];
        if (!conf.active) return false;
        
        if (matchType === "Prestasi") {
          return conf.isPrestasi !== false;
        } else if (matchType === "Pemasalan") {
          return conf.isPemasalan !== false;
        }
        return false;
      });

      allowedKeys.forEach(cat => {
        const conf = settings.classData[cat];
        if (conf.minYear && conf.maxYear) {
          if (fullYear >= conf.minYear && fullYear <= conf.maxYear) {
            matchedCategory = cat;
          }
        }
      });

      if (!matchedCategory) {"""

content = re.sub(old_logic, new_logic, content, flags=re.DOTALL)

with open('src/components/AthleteForm.tsx', 'w') as f:
    f.write(content)
