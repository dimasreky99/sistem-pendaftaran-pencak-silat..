import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_code = """                  SELANJUTNYA ▶
                </button>
              </div>
            )}"""

new_code = """                  SELANJUTNYA ▶
                </button>
              </div>
            )}
            </div>"""

# Only replace the first occurrence (which is the one inside atlet-seluruh)
content = content.replace(old_code, new_code, 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
