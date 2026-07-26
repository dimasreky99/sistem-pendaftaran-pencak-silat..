import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'  const handleUpdateProfile = \(updatedData: \{ pjName: string; nowa: string; photoUrl\?: string; managerPhotoUrl\?: string; official1Name\?: string; official1PhotoUrl\?: string; official2Name\?: string; official2PhotoUrl\?: string; \}\) => \{'
new_code = """  const handleUpdateProfile = (updatedData: { pjName: string; nowa: string; photoUrl?: string; managerPhotoUrl?: string; official1Name?: string; official1PhotoUrl?: string; official2Name?: string; official2PhotoUrl?: string; receiveNotifications?: boolean; }) => {"""

content = re.sub(pattern, new_code, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
