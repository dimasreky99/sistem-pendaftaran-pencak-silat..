with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

# Change window.print() to triggerPrint() in the top panel
content = content.replace('onClick={() => window.print()}\\n                className="bg-blue-600 hover:bg-blue-700 text-white font-black', 'onClick={triggerPrint}\\n                className="bg-blue-600 hover:bg-blue-700 text-white font-black')

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
print("Done fix print call")
