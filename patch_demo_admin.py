import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'\s*<button\s*onClick=\{\(\) => \{\s*setLoginUser\("DIM"\);\s*setLoginPass\("admin123"\);\s*\}\}\s*className="flex-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-\[10px\] py-2 rounded-lg border border-slate-850"\s*>\s*🛡️ Demo Admin\s*<\/button>'

content = re.sub(pattern, '', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
