import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('</div></button>\n              </div>\n            </div>', '</button>\n            </div>')

with open('src/App.tsx', 'w') as f:
    f.write(content)
