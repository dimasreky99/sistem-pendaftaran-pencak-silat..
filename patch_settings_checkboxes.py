import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

# 1. Update keys functions
key_pattern = r'  const getPrestasiKeys = \(\) => Object\.keys\(localSettings\.classData\).*?\n  const getPemasalanKeys = \(\) => Object\.keys\(localSettings\.classData\).*?\n'
new_keys = """  const getPrestasiKeys = () => Object.keys(localSettings.classData);
  const getPemasalanKeys = () => Object.keys(localSettings.classData);
"""
content = re.sub(key_pattern, new_keys, content, flags=re.DOTALL)

# 2. Add handlers
# Find `const handleToggleCategoryActive = `
handler_pattern = r'  const handleToggleCategoryActive = \(cat: string\) => \{\n    setLocalSettings\(\(prev\) => \{\n      const updatedClassData = \{ \.\.\.prev\.classData \};\n      updatedClassData\[cat\] = \{\n        \.\.\.updatedClassData\[cat\],\n        active: !updatedClassData\[cat\]\.active,\n      \};\n      return \{\n        \.\.\.prev,\n        classData: updatedClassData\n      \};\n    \}\);\n  \};'

new_handlers = """  const handleToggleCategoryActive = (cat: string) => {
    setLocalSettings((prev) => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[cat] = {
        ...updatedClassData[cat],
        active: !updatedClassData[cat].active,
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };

  const handleToggleCategoryPrestasi = (cat: string) => {
    setLocalSettings((prev) => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[cat] = {
        ...updatedClassData[cat],
        isPrestasi: updatedClassData[cat].isPrestasi === undefined ? false : !updatedClassData[cat].isPrestasi,
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };

  const handleToggleCategoryPemasalan = (cat: string) => {
    setLocalSettings((prev) => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[cat] = {
        ...updatedClassData[cat],
        isPemasalan: updatedClassData[cat].isPemasalan === undefined ? false : !updatedClassData[cat].isPemasalan,
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };
"""
content = re.sub(handler_pattern, new_handlers, content, flags=re.DOTALL)

# 3. Update Dropdown 1 checkboxes
d1_pattern = r'(🏆 Kategori Prestasi.*?checked=\{)config\.active(\}.*?onChange=\{\(\) => )handleToggleCategoryActive(\(cat\)\})'
content = re.sub(d1_pattern, r'\1config.isPrestasi ?? true\2handleToggleCategoryPrestasi\3', content, flags=re.DOTALL)

# 4. Update Dropdown 2 checkboxes
d2_pattern = r'(🏅 Kategori Pemasalan.*?checked=\{)config\.active(\}.*?onChange=\{\(\) => )handleToggleCategoryActive(\(cat\)\})'
content = re.sub(d2_pattern, r'\1config.isPemasalan ?? true\2handleToggleCategoryPemasalan\3', content, flags=re.DOTALL)

# 5. Fix config.active checks for displaying the inputs
d1_content_pattern = r'(🏆 Kategori Prestasi.*?)\{config\.active && \('
content = re.sub(d1_content_pattern, r'\1{(config.isPrestasi ?? true) && (', content, flags=re.DOTALL)

d2_content_pattern = r'(🏅 Kategori Pemasalan.*?)\{config\.active && \('
content = re.sub(d2_content_pattern, r'\1{(config.isPemasalan ?? true) && (', content, flags=re.DOTALL)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
