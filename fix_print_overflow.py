with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

old_css = """            body, html, #root {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }"""

new_css = """            body, html, #root {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 100% !important;
              overflow: visible !important;
            }"""

content = content.replace(old_css, new_css)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
