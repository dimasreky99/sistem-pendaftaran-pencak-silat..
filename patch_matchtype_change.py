import re

with open('src/components/AthleteForm.tsx', 'r') as f:
    content = f.read()

# Replace the onChange for matchType
old_onchange = r'                onChange=\{\(e\) => \{\n                  setMatchType\(e\.target\.value as any\);\n                  setKelas\(""\);\n                \}\}'
new_onchange = """                onChange={(e) => {
                  setMatchType(e.target.value as any);
                  setKelas("");
                  if (nik.length === 16) {
                     // small timeout to ensure state is updated if we were to use a ref, 
                     // but handleNikChange uses state. Actually handleNikChange takes the value as parameter, 
                     // but it uses the old matchType from closure! 
                     // This could be a bug. We should probably reset NIK or just show a message.
                     setNik("");
                     setNikError("Skema diubah, silakan ketik ulang atau copy-paste NIK Anda.");
                  }
                }}"""

content = re.sub(old_onchange, new_onchange, content)

with open('src/components/AthleteForm.tsx', 'w') as f:
    f.write(content)
