from collections import Counter
from PIL import Image
import os

def get_dominant_colors(image_path, num_colors=5):
    try:
        image = Image.open(image_path)
        image = image.convert('RGB')
        image = image.resize((150, 150))
        # Get colors from pixels
        pixels = list(image.getdata())
        counts = Counter(pixels)
        # Get most common
        common = counts.most_common(num_colors)
        
        print(f"Analysis for: {os.path.basename(image_path)}")
        for color, count in common:
            hex_color = '#{:02x}{:02x}{:02x}'.format(*color)
            print(f"Color: {hex_color} (RGB: {color}) - Count: {count}")
            
    except Exception as e:
        print(f"Error: {e}")

# Paths to the uploaded images
image_paths = [
    r"C:\Users\Jayson Quindao\.gemini\antigravity\brain\2b8d277a-8b77-4c02-82c2-dddd8ac7614d\uploaded_image_1765399928369.png",
    r"C:\Users\Jayson Quindao\.gemini\antigravity\brain\2b8d277a-8b77-4c02-82c2-dddd8ac7614d\uploaded_image_1765399971385.jpg"
]

for path in image_paths:
    if os.path.exists(path):
        get_dominant_colors(path)
    else:
        print(f"File not found: {path}")
