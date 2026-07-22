import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_refresh = """              onTriggerRefresh={() => {
                // re-fetch from storage to mock real sync
                const saved = localStorage.getItem("silat_athletes");
                if (saved) setAthletes(JSON.parse(saved));
                alert("Data sinkronisasi atlet berhasil ditarik dari server.");
              }}"""

new_refresh = """              onTriggerRefresh={() => {
                alert("Data sinkronisasi atlet sudah real-time terhubung dengan server (Firebase).");
              }}"""

content = content.replace(old_refresh, new_refresh)

with open('src/App.tsx', 'w') as f:
    f.write(content)
