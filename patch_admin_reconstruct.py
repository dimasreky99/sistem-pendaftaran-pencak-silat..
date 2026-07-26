import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

pattern = r'  onNavigateToPayment\?: \(\) => void;\s+onNavigateToAthletes,\s+onPrintLaporan\s+\}: DashboardAdminProps\) \{'
new_code = """  onNavigateToPayment?: () => void;
  onNavigateToAthletes?: () => void;
}

export default function DashboardAdmin({
  contingents,
  athletes,
  settings,
  onUpdatePayment,
  onToggleAcc,
  onRejectAthlete,
  onDeleteAthlete,
  onSelectAthleteForDetail,
  onViewOfficialId,
  onAccAll,
  onTriggerRefresh,
  onAddContingent,
  onAddAthleteForContingent,
  onImportExcelAthletes,
  onDeleteContingent,
  onNavigateToPayment,
  onNavigateToAthletes,
  onPrintLaporan
}: DashboardAdminProps) {"""

content = re.sub(pattern, new_code, content)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
