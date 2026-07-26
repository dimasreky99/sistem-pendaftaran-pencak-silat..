import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'(<div className="flex items-center gap-2\.5">)(\s+\{settings\.logoUrl && \(\s+<img src=\{settings\.logoUrl\} alt="Logo" className="h-8 w-8 object-contain rounded-md bg-white p-0\.5" />\s+\)\}\s+<div>\s+<h1 className="font-extrabold text-sm md:text-base tracking-tight leading-none uppercase">\{settings\.eventTitle\}</h1>\s+<span className="text-\[10px\] text-slate-400 font-bold uppercase tracking-wider block mt-1">Sistem Pendaftaran</span>\s+</div>)'

replacement = r'<button onClick={() => setActiveView("dashboard")} className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-80 transition-opacity">\2</button>'

content = re.sub(pattern, replacement, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
