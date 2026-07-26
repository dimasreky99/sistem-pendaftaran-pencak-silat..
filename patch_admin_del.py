import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

pattern = r'                                  onClick=\{\(\) => \{\s+const pwd = window\.prompt\(`Yakin ingin MENGHAPUS kontingen \$\{konti\.contingentName\}\? Ini juga akan menghapus semua atlet mereka\.\\n\\nMasukkan password master admin:`\);\s+if \(pwd === "masteradmin"\) \{\s+onDeleteContingent\(konti\.contingentName\);\s+\} else if \(pwd !== null\) \{\s+alert\("Password master admin salah!"\);\s+\}\s+\}\}'
new_code = """                                  onClick={() => {
                                    if (onDeleteContingent) onDeleteContingent(konti.contingentName);
                                  }}"""

content = re.sub(pattern, new_code, content)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
