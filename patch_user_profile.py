import re

with open('src/components/UserProfile.tsx', 'r') as f:
    content = f.read()

# Replace interface and destructured props
content = content.replace(
    '  onGantiPassword?: (oldPw: string, newPw: string) => void;\n  onUpdateProfile: (data: any) => void;\n  onUpdatePassword: (oldPw: string, newPw: string) => void;',
    '  onUpdateProfile: (data: any) => void;\n  onUpdatePassword: (oldPw: string, newPw: string) => void;'
)

content = content.replace('if(onUpdatePassword) onUpdatePassword(oldPassword, newPassword); if(onGantiPassword) onGantiPassword(oldPassword, newPassword);', 'if(onUpdatePassword) onUpdatePassword(oldPassword, newPassword);')

with open('src/components/UserProfile.tsx', 'w') as f:
    f.write(content)

# And in App.tsx
with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_content = app_content.replace('onGantiPassword={handleGantiPasswordActive}', 'onUpdatePassword={handleGantiPasswordActive}')

with open('src/App.tsx', 'w') as f:
    f.write(app_content)
