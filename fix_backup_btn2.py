with open('src/components/SystemSettings.tsx', 'r') as f:
    content = f.read()

content = content.replace('if(setToast) setToast({ message: "Backup data berhasil diunduh", type: "success" });', 'alert("Backup data berhasil diunduh");')

with open('src/components/SystemSettings.tsx', 'w') as f:
    f.write(content)
print("Done fix backup error")
