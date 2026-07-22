import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><DashboardAdmin', '<DashboardAdmin')
content = content.replace('<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-full"><DashboardContingent', '<div className="h-full"><DashboardContingent')

content = content.replace('            /></motion.div>', '            /></div>')
content = content.replace('            /></motion.div>', '            />') # the other one

wrapper_old = """              ) : (
                /* MAIN ACTIVE VIEW */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderActiveView()}
                </motion.div>
              )}"""

wrapper_new = """              ) : (
                /* MAIN ACTIVE VIEW */
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderActiveView()}
                </motion.div>
              )}"""

content = content.replace(wrapper_old, wrapper_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
