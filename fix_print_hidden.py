with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

content = content.replace('header, aside, footer, nav, .print:hidden, .print-hidden, .print\:hidden, button, select, input', 'header, aside, footer, nav, .print\\:hidden, .no-print, button, select, input')

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
print("Done fix print hidden")
