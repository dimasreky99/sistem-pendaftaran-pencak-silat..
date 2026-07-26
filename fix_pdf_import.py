import re

with open('src/components/AdminPaymentManagement.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { Athlete, Contingent, SystemSettings } from "../types";', 'import { Athlete, Contingent, SystemSettings } from "../types";\nimport { jsPDF } from "jspdf";\nimport autoTable from "jspdf-autotable";')

with open('src/components/AdminPaymentManagement.tsx', 'w') as f:
    f.write(content)
