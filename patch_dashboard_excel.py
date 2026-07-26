import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

# 1. Add prop to interface
prop_decl = r'  onAddAthleteForContingent\?: \(contingentName: string\) => void;'
new_prop_decl = """  onAddAthleteForContingent?: (contingentName: string) => void;
  onImportExcelAthletes?: (athletes: Athlete[]) => void;"""
content = re.sub(prop_decl, new_prop_decl, content)

# 2. Extract prop
prop_extract = r'  onAddAthleteForContingent,\n  onDeleteContingent,'
new_prop_extract = """  onAddAthleteForContingent,
  onImportExcelAthletes,
  onDeleteContingent,"""
content = content.replace(prop_extract, new_prop_extract)

# 3. Add xlsx import
import_xlsx = 'import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";\n'
new_import_xlsx = 'import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";\nimport * as XLSX from "xlsx";\n'
if 'import * as XLSX' not in content:
    content = content.replace(import_xlsx, new_import_xlsx)

# 4. Add handleFileUpload function
handler = """  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [visibleCount, setVisibleCount] = useState(20);"""
new_handler = """  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [visibleCount, setVisibleCount] = useState(20);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const importedAthletes: Athlete[] = data.map((row: any) => {
          // Flexible key matching for user-provided excel
          const getVal = (keys: string[]) => {
            const key = Object.keys(row).find(k => keys.some(searchKey => k.toLowerCase().includes(searchKey)));
            return key ? String(row[key] || "") : "";
          };

          const name = getVal(['nama', 'name', 'atlet']);
          const no = getVal(['nomor', 'no']);
          const kelas = getVal(['kelas', 'class']);
          const kategori = getVal(['kategori', 'category', 'usia']);
          const jkRaw = getVal(['jenis kelamin', 'jk', 'gender', 'kelamin']);
          const jk = jkRaw.toLowerCase().startsWith('pi') || jkRaw.toLowerCase() === 'f' || jkRaw.toLowerCase() === 'putri' ? 'Putri' : 'Putra';
          const kontingen = getVal(['kontingen', 'contingent', 'asal']) || "Kontingen Eksternal";

          return {
            id: "", // Will be set by App.tsx
            name: name || "Tanpa Nama",
            nik: no || Math.floor(Math.random() * 1000000000).toString(),
            tglLahir: "2000-01-01",
            jk,
            kategori,
            kelas,
            kontingen,
            nowa: "-",
            customData: settings.customFields ? settings.customFields.map(() => "") : [],
            fotos: settings.photoLabels ? settings.photoLabels.map(() => "") : [],
            isAcc: true, // "jika mengambil dari excel maka status acc semua"
            beratAktual: 0,
            statusTimbang: ""
          } as Athlete;
        });

        if (importedAthletes.length > 0 && onImportExcelAthletes) {
          if (window.confirm(`Ditemukan ${importedAthletes.length} data atlet dari Excel. Impor sekarang? (Semua akan otomatis berstatus ACC)`)) {
            onImportExcelAthletes(importedAthletes);
          }
        } else {
          alert("Gagal membaca data dari Excel. Pastikan terdapat kolom nama, kelas, kategori, jenis kelamin.");
        }
      } catch (err) {
        console.error("Excel import error:", err);
        alert("Gagal memproses file Excel.");
      }
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };"""
content = content.replace(handler, new_handler)

# 5. Add button to the UI
button_location = """          <button 
            onClick={() => {
              if (!isConfirmingReset) {"""
button_html = """          <label className="font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
            <span>📥 Import Excel</span>
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={() => {
              if (!isConfirmingReset) {"""
content = content.replace(button_location, button_html)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)

