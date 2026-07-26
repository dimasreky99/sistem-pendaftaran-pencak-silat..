import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add state
pattern1 = r'  const \[bulkIdCardsTargets, setBulkIdCardsTargets\] = useState<string\[\]>\(\[\]\);'
new_code1 = """  const [bulkIdCardsTargets, setBulkIdCardsTargets] = useState<string[]>([]);
  const [isPrintingLaporan, setIsPrintingLaporan] = useState(false);"""
content = re.sub(pattern1, new_code1, content)

# 2. Add import for CetakLaporanPDF
pattern2 = r'import RekapKontingen from "\./components/RekapKontingen";'
new_code2 = """import RekapKontingen from "./components/RekapKontingen";
import CetakLaporanPDF from "./components/CetakLaporanPDF";"""
content = re.sub(pattern2, new_code2, content)

# 3. Add onPrintLaporan to DashboardAdmin
pattern3 = r'              onAddContingent=\{handleAddContingent\}\s+/>'
new_code3 = """              onAddContingent={handleAddContingent}
              onPrintLaporan={() => {
                setIsPrintingLaporan(true);
                setTimeout(() => {
                  window.print();
                  setIsPrintingLaporan(false);
                }, 500);
              }}
            />"""
content = re.sub(pattern3, new_code3, content)

# 4. Hide main layout during print
pattern4 = r'          <main className=\{`flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto relative z-10 \$\{bulkIdCardsTargets\.length > 0 \? "no-print" : ""\}`\}>'
new_code4 = """          <main className={`flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto relative z-10 ${bulkIdCardsTargets.length > 0 || isPrintingLaporan ? "no-print" : ""}`}>"""
content = re.sub(pattern4, new_code4, content)

# 5. Render CetakLaporanPDF inside the print overlay section
pattern5 = r'          \{/\* 2\. PRINT TARGET OVERLAY \(ONLY DISPLAYED IN PRINT MODE FOR BADGES\) \*/\}\s+<div className="hidden print:block absolute inset-0 bg-white">'
new_code5 = """          {/* 2. PRINT TARGET OVERLAY (ONLY DISPLAYED IN PRINT MODE FOR BADGES) */}
          <div className="hidden print:block absolute inset-0 bg-white">
            {isPrintingLaporan && (
              <CetakLaporanPDF athletes={athletes} contingents={contingents} settings={settings} />
            )}"""
content = re.sub(pattern5, new_code5, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
