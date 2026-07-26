import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
import_pattern = r'import \{ useGoogleLogin \} from \'@react-oauth/google\';'
new_import = """import { useGoogleLogin } from '@react-oauth/google';
import DoubleConfirmModal from './components/DoubleConfirmModal';"""
content = re.sub(import_pattern, new_import, content)

# Add state
state_pattern = r'  const \[toast, setToast\] = useState<\{ message: string; type: "success" \| "error" \} \| null>\(null\);'
new_state = """  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [doubleConfirm, setDoubleConfirm] = useState<{ title: string; message: string; confirmWord: string; onConfirm: () => void } | null>(null);"""
content = re.sub(state_pattern, new_state, content)

# Change handleDeleteAthlete
delete_athlete_pattern = r'  const handleDeleteAthlete = \(athleteId: string\) => \{\s+if \(window\.confirm\("Apakah Anda yakin ingin menghapus data atlet ini secara permanen\?"\)\) \{\s+setAthletes\(prev => prev\.filter\(a => a\.id !== athleteId\)\);\s+appendLog\("HAPUS ATLET", `Menghapus atlet ID: \$\{athleteId\}`\);\s+setSelectedAthlete\(null\);\s+\}\s+\};'
new_delete_athlete = """  const handleDeleteAthlete = (athleteId: string) => {
    setDoubleConfirm({
      title: "Hapus Data Atlet",
      message: "Data atlet akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      confirmWord: "HAPUS",
      onConfirm: () => {
        setAthletes(prev => prev.filter(a => a.id !== athleteId));
        appendLog("HAPUS ATLET", `Menghapus atlet ID: ${athleteId}`);
        setSelectedAthlete(null);
        setDoubleConfirm(null);
      }
    });
  };"""
content = re.sub(delete_athlete_pattern, new_delete_athlete, content)

# Change handleResetSystem
reset_system_pattern = r'  const handleResetSystem = \(\) => \{\s+if \(window\.confirm\("PERINGATAN: Seluruh data atlet dan log tanding akan diarsipkan\. Lanjut\?"\)\) \{'
new_reset_system = """  const handleResetSystem = () => {
    setDoubleConfirm({
      title: "Arsipkan & Reset Sistem",
      message: "Seluruh data atlet, kontingen, dan log akan dihapus dari sistem. Sistem akan kembali kosong.",
      confirmWord: "RESET",
      onConfirm: () => {"""
content = re.sub(reset_system_pattern, new_reset_system, content)

# Close handleResetSystem's double confirm
reset_system_end_pattern = r'      setActiveView\("login"\);\s+alert\("Sistem berhasil diarsipkan & dikosongkan untuk turnamen baru!"\);\s+\}\s+\};'
new_reset_system_end = """      setActiveView("login");
      alert("Sistem berhasil diarsipkan & dikosongkan untuk turnamen baru!");
      setDoubleConfirm(null);
    }
    });
  };"""
content = re.sub(reset_system_end_pattern, new_reset_system_end, content)

# Add DoubleConfirmModal to render
render_pattern = r'      \{/\* Sidebar & Navigation \*/\}'
new_render = """      {doubleConfirm && (
        <DoubleConfirmModal
          title={doubleConfirm.title}
          message={doubleConfirm.message}
          confirmWord={doubleConfirm.confirmWord}
          onConfirm={doubleConfirm.onConfirm}
          onCancel={() => setDoubleConfirm(null)}
        />
      )}
      
      {/* Sidebar & Navigation */}"""
content = re.sub(render_pattern, new_render, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
