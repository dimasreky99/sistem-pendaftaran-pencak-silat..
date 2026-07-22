import re

with open('src/components/RekapPesertaKelas.tsx', 'r') as f:
    content = f.read()

old_rekap = """  const rekapData = useMemo(() => {
    // 1. Group by class
    const classGroups: Record<string, number> = {};
    athletes.forEach(a => {
      if (a.isAcc) {
        const cleanClass = a.kelas.replace(/ \[(?:Aktual|Validasi|Revisi):.*?\]/g, "");
        const cName = `${a.kategori} - ${a.jk} - ${cleanClass}`;
        classGroups[cName] = (classGroups[cName] || 0) + 1;
      }
    });

    // 2. Build rows and count matches
    const rows = Object.entries(classGroups).map(([className, participantCount]) => {
      const matchesCount = getBracketMatchesCount(className);
      const isSeni = /tunggal|ganda|beregu|jurus/i.test(className);
      return {
        className,
        participantCount,
        matchesCount,
        isSeni
      };
    });

    return rows;
  }, [athletes]);"""

new_rekap = """  const rekapData = useMemo(() => {
    // 1. Group by class
    const classGroups: Record<string, number> = {};
    athletes.forEach(a => {
      if (a.isAcc) {
        const cleanClass = a.kelas.replace(/ \[(?:Aktual|Validasi|Revisi):.*?\]/g, "");
        const cName = `${a.kategori} - ${a.jk} - ${cleanClass}`;
        classGroups[cName] = (classGroups[cName] || 0) + 1;
      }
    });

    // 2. Build rows and count matches
    const rows = Object.entries(classGroups).map(([className, rawCount]) => {
      let participantCount = rawCount;
      if (className.toLowerCase().includes("ganda")) {
        participantCount = Math.ceil(rawCount / 2);
      } else if (className.toLowerCase().includes("beregu")) {
        participantCount = Math.ceil(rawCount / 3);
      }
      
      const matchesCount = getBracketMatchesCount(className);
      const isSeni = /tunggal|ganda|beregu|jurus/i.test(className);
      return {
        className,
        participantCount,
        matchesCount,
        isSeni
      };
    });

    return rows;
  }, [athletes]);"""

content = content.replace(old_rekap, new_rekap)

with open('src/components/RekapPesertaKelas.tsx', 'w') as f:
    f.write(content)
