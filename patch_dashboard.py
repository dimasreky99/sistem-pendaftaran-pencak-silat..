import re

with open('src/components/DashboardAdmin.tsx', 'r') as f:
    content = f.read()

# Remove the charts block
charts_pattern = re.compile(r'\{\/\* DASHBOARD STATISTICS \*\/\}.*?(?=\{/\* Main View Grid \*\/\})', re.DOTALL)
content = charts_pattern.sub('', content)

# Remove unused imports
content = content.replace('import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";\n', '')
content = content.replace('import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";\nimport * as XLSX from "xlsx";\n', 'import * as XLSX from "xlsx";\n')

# Remove chartData, genderData definition
content = re.sub(r'  const categoryStats = .*?\n  const genderData = .*?\];\n', '', content, flags=re.DOTALL)

with open('src/components/DashboardAdmin.tsx', 'w') as f:
    f.write(content)
