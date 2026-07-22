import re

with open('src/components/DashboardContingent.tsx', 'r') as f:
    content = f.read()

# The kode unik block
pattern = r'<div className="flex justify-between text-rose-600 font-bold">\s*<span className="flex items-center gap-1">\s*Kode Unik Pembayaran:.*?\s*<\/span>\s*<span>\+\{contingent\.kodeUnik\}<\/span>\s*<\/div>'

content = re.sub(pattern, '', content, flags=re.DOTALL)

with open('src/components/DashboardContingent.tsx', 'w') as f:
    f.write(content)
