import re
with open('index.html', 'r') as f:
    content = f.read()

content = content.replace('<title>My Google AI Studio App</title>', '<title>Sistem Pendaftaran Pencak Silat</title>')

with open('index.html', 'w') as f:
    f.write(content)
