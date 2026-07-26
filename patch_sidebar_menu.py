import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

old_menu = """  const mainMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["admin", "kontingen"] },
    { id: "profile", label: "Data Profil", icon: User, roles: ["admin", "kontingen"] },
    { id: "pembayaran_kontingen", label: "Pembayaran", icon: CreditCard, roles: ["kontingen"] },
    { id: "kelola-pembayaran", label: "Pembayaran", icon: CreditCard, roles: ["admin"] },
    { id: "atlet-seluruh", label: "Data Seluruh Peserta", icon: Users, roles: ["admin"] },
      { id: "statistik-distribusi", label: "Statistik & Distribusi", icon: BarChart3, roles: ["admin"] },
];"""

new_menu = """  const mainMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["admin", "kontingen"] },
    { id: "rekap-kontingen", label: "Rekap Kelas", icon: ClipboardList, roles: ["kontingen"] },
    { id: "profile", label: "Data Profil", icon: User, roles: ["admin", "kontingen"] },
    { id: "pembayaran_kontingen", label: "Pembayaran", icon: CreditCard, roles: ["kontingen"] },
    { id: "kelola-pembayaran", label: "Pembayaran", icon: CreditCard, roles: ["admin"] },
    { id: "atlet-seluruh", label: "Data Seluruh Peserta", icon: Users, roles: ["admin"] },
    { id: "statistik-distribusi", label: "Statistik & Distribusi", icon: BarChart3, roles: ["admin"] },
];"""

content = content.replace(old_menu, new_menu)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
