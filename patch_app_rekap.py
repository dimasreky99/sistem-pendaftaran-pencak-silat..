import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace('import DashboardContingent from "./components/DashboardContingent";', 'import DashboardContingent from "./components/DashboardContingent";\nimport RekapKontingen from "./components/RekapKontingen";')

old_block = """        }
        return null;

      case "pembayaran_kontingen":"""

new_block = """        }
        return null;

      case "rekap-kontingen":
        if (currentUser && currentUser.role === "kontingen") {
          return <RekapKontingen athletes={athletes.filter(a => a.kontingen === currentUser.contingentName)} />;
        }
        return null;

      case "pembayaran_kontingen":"""

content = content.replace(old_block, new_block)

with open('src/App.tsx', 'w') as f:
    f.write(content)
