import re

with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

handler_pattern = r'  const handleToggleCategoryActive = \(category: string\) => \{\n    setLocalSettings\(prev => \{\n      const updatedClassData = \{ \.\.\.prev\.classData \};\n      updatedClassData\[category\] = \{\n        \.\.\.updatedClassData\[category\],\n        active: !updatedClassData\[category\]\.active\n      \};\n      return \{\n        \.\.\.prev,\n        classData: updatedClassData\n      \};\n    \}\);\n  \};'

new_handlers = """  const handleToggleCategoryActive = (category: string) => {
    setLocalSettings(prev => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[category] = {
        ...updatedClassData[category],
        active: !updatedClassData[category].active
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };

  const handleToggleCategoryPrestasi = (cat: string) => {
    setLocalSettings(prev => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[cat] = {
        ...updatedClassData[cat],
        isPrestasi: updatedClassData[cat].isPrestasi === undefined ? false : !updatedClassData[cat].isPrestasi
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };

  const handleToggleCategoryPemasalan = (cat: string) => {
    setLocalSettings(prev => {
      const updatedClassData = { ...prev.classData };
      updatedClassData[cat] = {
        ...updatedClassData[cat],
        isPemasalan: updatedClassData[cat].isPemasalan === undefined ? false : !updatedClassData[cat].isPemasalan
      };
      return {
        ...prev,
        classData: updatedClassData
      };
    });
  };
"""

content = re.sub(handler_pattern, new_handlers, content, flags=re.DOTALL)

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
