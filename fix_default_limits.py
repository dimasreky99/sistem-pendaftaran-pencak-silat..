with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

content = content.replace('const dayLim = dailyLimits[dayNum] || { pagi: 15, siang: 15, malam: 15 };', 'const dayLim = dailyLimits[dayNum] || { pagi: autoSessionLimit, siang: autoSessionLimit, malam: autoSessionLimit };')

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
print("Done fixing default limits UI")
