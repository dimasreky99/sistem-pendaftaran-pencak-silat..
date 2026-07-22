import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_log = """    const newLog: ActivityLog = {
      timestamp: new Date().toISOString(),"""

new_log = """    const newLog: ActivityLog = {
      id: "LOG_" + Date.now() + "_" + Math.floor(Math.random()*1000),
      timestamp: new Date().toISOString(),"""

content = content.replace(old_log, new_log)

with open('src/App.tsx', 'w') as f:
    f.write(content)
