with open('src/components/ScheduleModule.tsx', 'r') as f:
    content = f.read()

old_csv = """    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jadwal_Pertandingan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);"""

new_csv = """    const csvContent = [headers.join(","), ...rows].join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Jadwal_Pertandingan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);"""

content = content.replace(old_csv, new_csv)

with open('src/components/ScheduleModule.tsx', 'w') as f:
    f.write(content)
