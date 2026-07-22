import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('''setLogs(prev => [{
          timestamp: new Date().toISOString(),
          user: currentUser.username || currentUser.contingentName,
          action: "UPDATE_PROFILE",
          detail: "Mengubah data penanggung jawab dan/atau foto bukti pembayaran"
        }, ...prev]);''', '''setLogs(prev => [{
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          user: currentUser.username || currentUser.contingentName,
          action: "UPDATE_PROFILE",
          detail: "Mengubah data penanggung jawab dan/atau foto bukti pembayaran"
        }, ...prev]);''')

content = content.replace('''setLogs(prev => [{
          timestamp: new Date().toISOString(),
          user: found.role === "admin" ? found.username : found.contingentName,
          action: "LOGIN",
          detail: "Berhasil masuk ke sistem"
        }, ...prev]);''', '''setLogs(prev => [{
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          user: found.role === "admin" ? found.username : found.contingentName,
          action: "LOGIN",
          detail: "Berhasil masuk ke sistem"
        }, ...prev]);''')

with open('src/App.tsx', 'w') as f:
    f.write(content)
