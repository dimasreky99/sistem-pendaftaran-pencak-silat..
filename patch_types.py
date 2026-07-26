import re

with open('src/types.ts', 'r') as f:
    content = f.read()

pattern = r'  role: "admin" \| "kontingen";'
new_code = """  role: "admin" | "kontingen";
  receiveNotifications?: boolean;"""

content = re.sub(pattern, new_code, content)

with open('src/types.ts', 'w') as f:
    f.write(content)
