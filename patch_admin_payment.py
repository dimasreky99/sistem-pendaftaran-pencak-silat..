import re

with open('src/components/AdminPaymentManagement.tsx', 'r') as f:
    content = f.read()

# Remove the table header
content = content.replace('<th className="py-3.5 px-4 text-right">Tagihan Sistem / Revisi</th>', '')

# Remove the table data column for bill
# we need to find from 
#                       {/* Bill / Overridable Nominal */}
# down to the next 
#                       {/* Receipt Upload Proof */}

pattern = r'\s*\{\/\* Bill \/ Overridable Nominal \*\/\}.*?(?=\s*\{\/\* Receipt Upload Proof \*\/\})'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open('src/components/AdminPaymentManagement.tsx', 'w') as f:
    f.write(content)
