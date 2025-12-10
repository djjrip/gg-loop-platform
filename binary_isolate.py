import sys

# Read the file
with open('server/routes.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

total_lines = len(lines)
print(f"Total lines in routes.ts: {total_lines}")

# Find line 2500 (index 2499)
split_at = 2499

# Keep top half, comment out bottom half
top_half = lines[:split_at]
bottom_half_comment = [
    "\n",
    "/*\n",
    "========================================\n",
    "BINARY ISOLATION: Lines 2500-END DISABLED\n",
    "========================================\n",
    "*/\n",
    "\n",
    "      return createServer(app);\n",
    "    }\n",
    "}\n"
]

# Write modified file
with open('server/routes.ts', 'w', encoding='utf-8') as f:
    f.writelines(top_half + bottom_half_comment)

print(f"✅ Binary isolation: Commented out lines {split_at+1}-{total_lines}")
print("✅ Added minimal closing structure")
print("\n🧪 Now test with: npx tsx server/index.ts")
