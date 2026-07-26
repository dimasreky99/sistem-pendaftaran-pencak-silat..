import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'  const \[activeView, setActiveView\] = useState<string>\(\(\) => \{'
new_code = """  const [doubleConfirm, setDoubleConfirm] = useState<{ title: string; message: string; confirmWord: string; onConfirm: () => void } | null>(null);
  const [activeView, setActiveView] = useState<string>(() => {"""

content = re.sub(pattern, new_code, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
