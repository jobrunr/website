import os
import re
from pathlib import Path

# --- Configuration ---
# Only check the first N lines of the file for the keys
MAX_LINES_TO_CHECK = 40

# Define the replacement pairs (Old Key: New Key)
REPLACEMENT_MAP = {
    # 1. feature_image: -> image:
    re.compile(r'^feature_image\s*:\s*(.*)$', re.IGNORECASE): 'image:',
    # 2. summary: -> description:
    re.compile(r'^summary\s*:\s*(.*)$', re.IGNORECASE): 'description:',
}
# ---------------------

def update_markdown_files():
    """
    Scans for .md files and performs the specified frontmatter key replacements.
    """
    
    print("🤖 Starting frontmatter update...")
    
    # Use glob to find all .md files in the current directory
    markdown_files = list(Path('.').glob('*.md'))
    
    if not markdown_files:
        print("🤷‍♀️ No .md files found in the current directory. Aborting.")
        return

    for file_path in markdown_files:
        is_modified = False
        
        # Read the file content
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except UnicodeDecodeError:
            print(f"⚠️ Skipping {file_path.name}: Encountered Unicode Decode Error.")
            continue

        new_lines = []
        
        # Iterate through the lines, applying replacements only within the limit
        for i, line in enumerate(lines):
            
            # Check for replacements only in the first MAX_LINES_TO_CHECK
            if i < MAX_LINES_TO_CHECK:
                original_line = line
                
                for old_key_pattern, new_key in REPLACEMENT_MAP.items():
                    match = old_key_pattern.match(line)
                    
                    if match:
                        # Extract the value part (everything after the colon and spaces)
                        value_part = match.group(1).strip()
                        
                        # Reconstruct the line with the new key and the original value
                        # We use f-strings for clarity in reconstruction
                        new_line = f"{new_key} {value_part}\n"
                        
                        # Use the new line for further checks in case multiple keys are in one file
                        line = new_line
                        is_modified = True
                        
                        print(f"   - Replaced '{old_key_pattern.pattern.strip('^').strip('$').split('(')[0]}' in {file_path.name}")
                        break # Only perform one replacement per line
                
                new_lines.append(line)
            else:
                # Once we pass the limit, append the rest of the file and stop checking
                new_lines.extend(lines[i:])
                break
        
        # Write the modified content back to the file
        if is_modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
                
    print("\n✨ Frontmatter update complete!")

if __name__ == "__main__":
    update_markdown_files()