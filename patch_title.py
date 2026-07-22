import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

effect_pattern = r'  useEffect\(\(\) => \{\n    if \(currentUser && currentUser.role !== "admin"\) \{'
new_effect = """  // Update document title dynamically
  useEffect(() => {
    if (settings && settings.eventTitle) {
      document.title = settings.eventTitle;
    } else {
      document.title = "Sistem Pendaftaran Pencak Silat";
    }
  }, [settings?.eventTitle]);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {"""

content = content.replace('  useEffect(() => {\n    if (currentUser && currentUser.role !== "admin") {', new_effect)

with open('src/App.tsx', 'w') as f:
    f.write(content)
