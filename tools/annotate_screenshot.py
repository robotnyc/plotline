from PIL import Image, ImageDraw, ImageFont
import os

# Load the image
img_path = 'docs/screenshot.png'
output_path = 'docs/screenshot-annotated.png'

try:
    img = Image.open(img_path).convert('RGB')
    draw = ImageDraw.Draw(img)
except Exception as e:
    print(f"Error loading image: {e}")
    exit(1)

# Define features: (x1, y1, x2, y2, label)
features = [
    (1160, 80, 1495, 190, "Overall progress"),
    (1160, 200, 1495, 570, "Section progress"),
    (1160, 580, 1495, 770, "Progress over time"),
    (1160, 780, 1495, 980, "Progress trends")
]

# Try to load a font, fallback to default
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
except:
    font = ImageFont.load_default()

for (x1, y1, x2, y2, label) in features:
    # Draw rectangle
    draw.rectangle([x1, y1, x2, y2], outline="red", width=5)

    # Calculate vertical center of the box
    y_center = (y1 + y2) // 2

    # Calculate text position (to the left of the box)
    text_bbox = draw.textbbox((0, 0), label, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    label_x = x1 - text_width - 100  # 100 pixels gap for the arrow
    label_y = y_center - (text_height // 2)

    # Draw label text in red
    draw.text((label_x, label_y), label, fill="red", font=font)

    # Draw arrow from text to box
    arrow_start = (label_x + text_width + 10, y_center)
    arrow_end = (x1 - 10, y_center)
    draw.line([arrow_start, arrow_end], fill="red", width=3)

    # Simple arrow head
    head_size = 10
    draw.polygon([
        arrow_end,
        (arrow_end[0] - head_size, arrow_end[1] - head_size),
        (arrow_end[0] - head_size, arrow_end[1] + head_size)
    ], fill="red")

# Save the annotated image
img.save(output_path)
print(f"Annotated image saved to {output_path}")
