import re

with open('src/components/AdminPaymentManagement.tsx', 'r') as f:
    content = f.read()

# Add onUpdateSettings to Props
props_old = """interface AdminPaymentManagementProps {
  contingents: Contingent[];
  athletes: Athlete[];
  settings: SystemSettings;
  onUpdateContingentPaymentStatus: (contingentId: string, status: "Lunas" | "Belum Lunas") => void;
  onUpdateContingentNominalRevisi: (contingentId: string, nominal?: number) => void;
  onUpdateInvoiceNumber?: (contingentId: string, invoiceNum: string) => void;
}"""

props_new = """interface AdminPaymentManagementProps {
  contingents: Contingent[];
  athletes: Athlete[];
  settings: SystemSettings;
  onUpdateContingentPaymentStatus: (contingentId: string, status: "Lunas" | "Belum Lunas") => void;
  onUpdateContingentNominalRevisi: (contingentId: string, nominal?: number) => void;
  onUpdateInvoiceNumber?: (contingentId: string, invoiceNum: string) => void;
  onUpdateSettings?: (newSettings: SystemSettings) => void;
}"""
content = content.replace(props_old, props_new)

# Add it to component params
comp_old = """export default function AdminPaymentManagement({
  contingents,
  athletes,
  settings,
  onUpdateContingentPaymentStatus,
  onUpdateContingentNominalRevisi,
  onUpdateInvoiceNumber
}: AdminPaymentManagementProps) {"""

comp_new = """export default function AdminPaymentManagement({
  contingents,
  athletes,
  settings,
  onUpdateContingentPaymentStatus,
  onUpdateContingentNominalRevisi,
  onUpdateInvoiceNumber,
  onUpdateSettings
}: AdminPaymentManagementProps) {"""
content = content.replace(comp_old, comp_new)

with open('src/components/AdminPaymentManagement.tsx', 'w') as f:
    f.write(content)

