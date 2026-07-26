import re

with open('src/components/AthleteForm.tsx', 'r') as f:
    content = f.read()

categorize_logic = r'      // Auto assign Category based on Year ranges defined in settings(.*?)alert\(`NIK VALID!\\nLahir: \$\{dd\}/\$\{mm\}/\$\{fullYear\} \(\$\{age\} tahun\)\\nGender: \$\{calculatedJk\}\\nKategori: \$\{matchedCategory\}\`\);\n    \}'

new_logic = """      // Auto assign Category based on Year ranges defined in settings
      let matchedCategory = "";
      
      const PRESTASI_KEYS = ["Remaja", "Dewasa", "Master 1", "Master 2"];
      const PEMASALAN_KEYS = ["Pra Usia Dini", "Usia Dini 1", "Usia Dini 2", "Pra Remaja"];
      
      const allowedKeys = Object.keys(settings.classData).filter(cat => {
        if (settings.matchType === "Prestasi") return !PEMASALAN_KEYS.includes(cat);
        if (settings.matchType === "Pemasalan") return PEMASALAN_KEYS.includes(cat);
        return true; // Keduanya
      });

      allowedKeys.forEach(cat => {
        const conf = settings.classData[cat];
        if (conf.active && conf.minYear && conf.maxYear) {
          if (fullYear >= conf.minYear && fullYear <= conf.maxYear) {
            matchedCategory = cat;
          }
        }
      });

      if (!matchedCategory) {
        setNikError(`Tidak ada kategori aktif yang sesuai dengan tahun lahir ${fullYear} pada skema ${settings.matchType}.`);
        return;
      }

      setTglLahir(`${fullYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`);
      setJk(calculatedJk);
      setKategori(matchedCategory);
      setKelas(""); // Reset class for category

      // Trigger standard sweetalert / native notification
      // alert(`NIK VALID!\\nLahir: ${dd}/${mm}/${fullYear} (${age} tahun)\\nGender: ${calculatedJk}\\nKategori: ${matchedCategory}`);
    }"""

content = re.sub(categorize_logic, new_logic, content, flags=re.DOTALL)

with open('src/components/AthleteForm.tsx', 'w') as f:
    f.write(content)
