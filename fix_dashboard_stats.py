import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

calc_pattern = r'  const pendingAccCount = athletes\.filter\(a => !a\.isAcc\)\.length;'
new_calc = """  const pendingAccCount = athletes.filter(a => !a.isAcc).length;

  const categoryStats = athletes.reduce((acc: any, athlete) => {
    const cat = athlete.kategori || 'Lainnya';
    if (!acc[cat]) acc[cat] = { name: cat, Putra: 0, Putri: 0, Total: 0 };
    if (athlete.jk === 'Putra') acc[cat].Putra++;
    if (athlete.jk === 'Putri') acc[cat].Putri++;
    acc[cat].Total++;
    return acc;
  }, {});
  const chartData = Object.values(categoryStats).sort((a: any, b: any) => b.Total - a.Total);

  const genderData = [
    { name: 'Putra', value: athletes.filter(a => a.jk === 'Putra').length, color: '#3b82f6' },
    { name: 'Putri', value: athletes.filter(a => a.jk === 'Putri').length, color: '#ec4899' }
  ];
"""
content = re.sub(calc_pattern, new_calc, content)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)

