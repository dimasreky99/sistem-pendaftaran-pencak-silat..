import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I messed up the block. Let's find it.
block = r"""                <div>
                  <h1 className="font-extrabold text-sm md:text-base tracking-tight leading-none uppercase">{settings.eventTitle}</h1>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Sistem Pendaftaran</span>
                </button>
            </div>"""

new_block = r"""                <div>
                  <h1 className="font-extrabold text-sm md:text-base tracking-tight leading-none uppercase">{settings.eventTitle}</h1>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Sistem Pendaftaran</span>
                </div>
              </button>
            </div>"""

if block in content:
    content = content.replace(block, new_block)
else:
    print("Block not found")

with open('src/App.tsx', 'w') as f:
    f.write(content)
