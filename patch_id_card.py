import re

with open('src/components/IdCardPreview.tsx', 'r') as f:
    content = f.read()

content = content.replace('}: IdCardPreviewProps) {', '}: IdCardPreviewProps) {\n  const [filterMode, setFilterMode] = useState<"ALL" | "OFFICIAL" | "ATLET">("ALL");')

with open('src/components/IdCardPreview.tsx', 'w') as f:
    f.write(content)
