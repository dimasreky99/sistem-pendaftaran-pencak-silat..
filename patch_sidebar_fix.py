import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

bad_block = """              {/* Sekretariat Pertandingan Dropdown */}
              {userRole === "admin" && (
                <>
                  {userRole === "admin" && (
                <>
"""

good_block = """              {/* Sekretariat Pertandingan Dropdown */}
              {userRole === "admin" && (
                <>
"""

content = content.replace(bad_block, good_block)

bad_end_block = """                  )}
                </>
              )}
              <div className="pt-4 border-t border-slate-800/40">"""

good_end_block = """                  )}
                </>
              )}
              <div className="pt-4 border-t border-slate-800/40">"""

# Actually wait, let me just replace the double `userRole === "admin"` check
# It is literally:
#              {userRole === "admin" && (
#                <>
#                  {userRole === "admin" && (
#                <>

# If I replace it with just one, there's a missing `</>` and `)}` ?
# Let's see: The end is:
#                  )}
#                </>
#              )}
# So it was closing TWO blocks previously? Or just one?
# Wait, before my patch, it was:
#              {/* Sekretariat Pertandingan Dropdown */}
#              {userRole === "admin" && (
#                <>
#                  ... <div className="pt-4 border-t border-slate-800/40"> ...

# If I remove the inner `{userRole === "admin" && (<>`, I also need to remove the extra closing `</>` and `)}`. Let me just replace the whole section from Dropdown to Active Users.
