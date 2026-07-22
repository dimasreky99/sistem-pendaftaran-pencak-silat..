import re
with open('src/components/BracketsModule.tsx', 'r') as f:
    content = f.read()

# I want to add `justify-center w-full` to the flex container for brackets.
content = content.replace('className="flex gap-8 items-stretch py-4 min-w-max"', 'className="flex gap-8 items-stretch justify-center w-full min-w-max py-4"')

with open('src/components/BracketsModule.tsx', 'w') as f:
    f.write(content)
print("Done center brackets")
