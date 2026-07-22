import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'  const \[settings, setSettings\] = useState<SystemSettings>\(\(\) => \{.*?\n  \}\);'

new_settings = '  const [settings, setSettings, isSettingsLoaded] = useFirebaseDoc<SystemSettings>("globals/settings", DEFAULT_SETTINGS);'

content = re.sub(pattern, new_settings, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
