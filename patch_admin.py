import re
with open('src/components/AdminManagement.tsx', 'r') as f:
    content = f.read()

content = content.replace('contingents.filter(c => c.role === "admin" && c.username !== "DIM");', 'contingents.filter(c => c.role === "admin");')

old_delete = """                            <button
                              onClick={() => handleDeleteSub(sub.id, sub.username)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg"
                            >
                              <Trash2 size={13} />
                            </button>"""

new_delete = """                            {sub.username !== "DIM" && (
                              <button
                                onClick={() => handleDeleteSub(sub.id, sub.username)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}"""

content = content.replace(old_delete, new_delete)

with open('src/components/AdminManagement.tsx', 'w') as f:
    f.write(content)
