import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('''    const newLog: ActivityLog = {
      timestamp: wibDate.replace(/\//g, "-"),''', '''    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: wibDate.replace(/\//g, "-"),''')

content = content.replace('''    const newLog: ActivityLog = {
      timestamp: wibDate2.replace(/\//g, "-"),''', '''    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: wibDate2.replace(/\//g, "-"),''')

with open('src/App.tsx', 'w') as f:
    f.write(content)
