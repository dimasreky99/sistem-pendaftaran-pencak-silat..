with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

content = content.replace('no-print', 'print:hidden')

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
print("Done fix no-print")
