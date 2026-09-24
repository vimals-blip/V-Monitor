import sys
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We will replace all text-white and hover:text-white except for those inside bg-[#1A2333] or similar.
    # We can just do a function to replace text-white based on its context.

    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'bg-[#1A2333]' in line and 'text-white' in line:
            continue # Keep text-white for this specific button
            
        if 'hover:text-white' in line and not 'dark:hover:text-white' in line:
            lines[i] = line.replace('hover:text-white', 'hover:text-slate-900 dark:hover:text-white')
        
        if 'text-white' in lines[i] and not 'dark:text-white' in lines[i] and not 'hover:text-white' in lines[i]:
            lines[i] = lines[i].replace('text-white', 'text-slate-900 dark:text-white')

    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

if __name__ == "__main__":
    for arg in sys.argv[1:]:
        process_file(arg)
