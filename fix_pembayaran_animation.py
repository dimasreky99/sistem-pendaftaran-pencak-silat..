with open('src/components/PembayaranContingentView.tsx', 'r') as f:
    content = f.read()

old_return = """  return (
    <div className="space-y-6">"""
new_return = """  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
      className="space-y-6"
    >"""

content = content.replace(old_return, new_return)
content = content.replace('    </div>\n  );\n}', '    </motion.div>\n  );\n}')

with open('src/components/PembayaranContingentView.tsx', 'w') as f:
    f.write(content)
print("Done fix pembayaran animation")
