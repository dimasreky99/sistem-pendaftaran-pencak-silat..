import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'              onAddContingent=\{handleAddContingent\}'
new_code = """              onAddContingent={handleAddContingent}
              onPrintLaporan={() => {
                setIsPrintingLaporan(true);
                setTimeout(() => {
                  window.print();
                  setIsPrintingLaporan(false);
                }, 500);
              }}"""

content = re.sub(pattern, new_code, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
