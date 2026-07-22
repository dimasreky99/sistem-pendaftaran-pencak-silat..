import sys

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

with open('src/App.tsx', 'w') as f:
    for i, line in enumerate(lines):
        if 319 <= i+1 <= 351:
            continue
        f.write(line)
