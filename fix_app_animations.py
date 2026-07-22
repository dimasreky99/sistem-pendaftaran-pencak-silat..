with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add motion.div wrapper helper function, or I can just use it directly.
def wrap_with_motion(view_name, component_jsx):
    return f"""<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full">
            {component_jsx}
          </motion.div>"""

# We'll just replace specific returns in App.tsx manually.

old_pembayaran = """          return (
            <PembayaranContingentView
              contingent={currentUser}
              athletes={athletes}
              settings={settings}
              onUploadReceipt={handleUploadReceipt}
            />
          );"""
new_pembayaran = """          return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full">
              <PembayaranContingentView
                contingent={currentUser}
                athletes={athletes}
                settings={settings}
                onUploadReceipt={handleUploadReceipt}
              />
            </motion.div>
          );"""
content = content.replace(old_pembayaran, new_pembayaran)

old_bagan = """        return (
          <BracketsModule
            athletes={athletes}
            settings={settings}
          />
        );"""
new_bagan = """        return (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full">
            <BracketsModule
              athletes={athletes}
              settings={settings}
            />
          </motion.div>
        );"""
content = content.replace(old_bagan, new_bagan)

old_jadwal = """        return (
          <ScheduleModule
            athletes={athletes}
            settings={settings}
          />
        );"""
new_jadwal = """        return (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full">
            <ScheduleModule
              athletes={athletes}
              settings={settings}
            />
          </motion.div>
        );"""
content = content.replace(old_jadwal, new_jadwal)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Done fix animations")
