import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'  const handleDeleteContingent = \(contingentName: string\) => \{\s+setContingents\(prev => prev\.filter\(c => c\.contingentName !== contingentName\)\);\s+setAthletes\(prev => prev\.filter\(a => a\.kontingen !== contingentName\)\);\s+appendLog\("HAPUS KONTINGEN", `Admin menghapus kontingen \$\{contingentName\} beserta seluruh atletnya\.`\);\s+\};'
new_code = """  const handleDeleteContingent = (contingentName: string) => {
    setDoubleConfirm({
      title: "Hapus Kontingen",
      message: `Kontingen ${contingentName} beserta SELURUH data atletnya akan dihapus permanen.`,
      confirmWord: "HAPUS",
      onConfirm: () => {
        setContingents(prev => prev.filter(c => c.contingentName !== contingentName));
        setAthletes(prev => prev.filter(a => a.kontingen !== contingentName));
        appendLog("HAPUS KONTINGEN", `Admin menghapus kontingen ${contingentName} beserta seluruh atletnya.`);
        setDoubleConfirm(null);
      }
    });
  };"""
content = re.sub(pattern, new_code, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
