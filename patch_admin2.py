import re

with open('src/components/AdminManagement.tsx', 'r') as f:
    content = f.read()

old_code = """                        <td className="py-3.5 px-4 font-black text-slate-900 uppercase">
                          {sub.username}
                        </td>"""

new_code = """                        <td className="py-3.5 px-4 font-black text-slate-900 uppercase flex items-center gap-2">
                          {sub.username}
                          {sub.username === "DIM" && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wide">
                              MASTER
                            </span>
                          )}
                        </td>"""

content = content.replace(old_code, new_code)

with open('src/components/AdminManagement.tsx', 'w') as f:
    f.write(content)
