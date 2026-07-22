import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = 'import LoadingOverlay from "./components/LoadingOverlay";\n'
if 'LoadingOverlay' not in content:
    content = content.replace('import React, { useState, useEffect } from "react";', 'import React, { useState, useEffect } from "react";\n' + import_stmt)

# Add state
if 'const [isGlobalLoading, setIsGlobalLoading]' not in content:
    content = content.replace('const [isSidebarOpen, setIsSidebarOpen] = useState(false);', 'const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n  const [isGlobalLoading, setIsGlobalLoading] = useState(false);\n')

# Add component to render (at the very bottom, before the last `</div>`)
# find the last `</div>`
last_div = content.rfind('</div>')
if last_div != -1:
    content = content[:last_div] + '  <LoadingOverlay isLoading={isGlobalLoading} />\n    </div>' + content[last_div+6:]

# Optionally, wrap handleGoogleLogin in loading state just as an example of async
old_sync = """  const handleTriggerSheetsSync = async () => {
    googleLoginForSync();
  };"""
new_sync = """  const handleTriggerSheetsSync = async () => {
    setIsGlobalLoading(true);
    try {
      googleLoginForSync();
    } finally {
      setTimeout(() => setIsGlobalLoading(false), 2000); // give some time for popup
    }
  };"""

content = content.replace(old_sync, new_sync)

with open('src/App.tsx', 'w') as f:
    f.write(content)
