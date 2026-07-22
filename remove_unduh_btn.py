with open('src/App.tsx', 'r') as f:
    content = f.read()

import re
# Remove the <button> UNDUH ID CARD BADGE block
content = re.sub(r'\{selectedAthlete\.isAcc && \(\s*<button\s*onClick=\{[^}]+\}\s*className="[^"]+"\s*>\s*🪪 UNDUH ID CARD BADGE\s*</button>\s*\)\}', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
