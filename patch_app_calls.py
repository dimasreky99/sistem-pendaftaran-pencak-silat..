import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("sendAutoWhatsApp(waMessage, settings);", "sendAutoWhatsApp(waMessage, settings, undefined, contingents);")

with open('src/App.tsx', 'w') as f:
    f.write(content)
