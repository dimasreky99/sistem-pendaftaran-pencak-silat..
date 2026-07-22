with open('src/App.tsx', 'r') as f:
    content = f.read()

old_wrapper = """                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderActiveView()}
                </motion.div>"""
new_wrapper = """                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  {renderActiveView()}
                </motion.div>"""

content = content.replace(old_wrapper, new_wrapper)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Done fix wrapper")
