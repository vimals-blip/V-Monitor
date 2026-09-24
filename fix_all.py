import sys
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    replacements = {
        r'\bbg-\[\#0F172A\]/80\b': 'bg-white/80 dark:bg-[#0F172A]/80',
        r'\bbg-\[\#0F172A\]\b': 'bg-white dark:bg-[#0F172A]',
        r'\bbg-\[\#121824\]\b': 'bg-white dark:bg-[#121824]',
        r'\bbg-\[\#0B0F17\]\b': 'bg-slate-50 dark:bg-[#0B0F17]',
        r'\bbg-\[\#090D16\]\b': 'bg-slate-50 dark:bg-[#090D16]',
        r'\bbg-\[\#161F30\]\b': 'bg-slate-50 dark:bg-[#161F30]',
        r'\bbg-\[\#1C263A\]\b': 'bg-slate-100 dark:bg-[#1C263A]',
        r'\bbg-\[\#0D121D\]\b': 'bg-slate-50 dark:bg-[#0D121D]',
        
        r'\bborder-\[\#1E293B\]\b': 'border-slate-200 dark:border-[#1E293B]',
        r'\bborder-\[\#222E45\]\b': 'border-slate-200 dark:border-[#222E45]',
        r'\bborder-\[\#2A3A5C\]\b': 'border-slate-200 dark:border-[#2A3A5C]',
        
        r'\btext-slate-400\b': 'text-slate-500 dark:text-slate-400',
        r'\btext-slate-300\b': 'text-slate-600 dark:text-slate-300',
        
        r'\btext-cyan-400\b': 'text-cyan-600 dark:text-cyan-400',
        r'\btext-blue-400\b': 'text-blue-600 dark:text-blue-400',
        r'\btext-emerald-400\b': 'text-emerald-600 dark:text-emerald-400',
        r'\btext-amber-400\b': 'text-amber-600 dark:text-amber-400',
        r'\btext-red-400\b': 'text-red-600 dark:text-red-400',
        
        r'\bhover:bg-\[\#161F30\]\b': 'hover:bg-slate-50 dark:hover:bg-[#161F30]',
        r'\bhover:bg-slate-800\b': 'hover:bg-slate-100 dark:hover:bg-slate-800',
        
        r'\bdivide-\[\#222E45\]\b': 'divide-slate-200 dark:divide-[#222E45]',
        r'\bdivide-\[\#1E293B\]\b': 'divide-slate-200 dark:divide-[#1E293B]',
        
        r'\bbg-amber-950/40\b': 'bg-amber-50 dark:bg-amber-950/40',
        r'\bring-\[\#1E293B\]\b': 'ring-slate-200 dark:ring-[#1E293B]',
    }

    for pattern, replacement in replacements.items():
        pat = r'(?<!dark:)' + pattern
        content = re.sub(pat, replacement, content)

    # Now for text-white
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'bg-[#1A2333]' in line or 'bg-blue-600' in line or 'bg-cyan-500' in line or 'bg-rose-600' in line or 'bg-red-500' in line or 'fill-white' in line:
            # Leave text-white alone in these buttons/elements
            pass
        else:
            if 'hover:text-white' in line and 'dark:hover:text-white' not in line:
                lines[i] = line.replace('hover:text-white', 'hover:text-slate-900 dark:hover:text-white')
            
            # Re-fetch line in case it was modified
            line = lines[i]
            
            # Replace text-white if not already dark:text-white
            if 'text-white' in line and 'dark:text-white' not in line and 'hover:text-white' not in line:
                # regex to ensure word boundary
                lines[i] = re.sub(r'(?<!dark:)\btext-white\b', 'text-slate-900 dark:text-white', line)

    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

if __name__ == "__main__":
    for arg in sys.argv[1:]:
        process_file(arg)
