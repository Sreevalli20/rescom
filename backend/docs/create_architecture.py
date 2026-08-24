"""
Create architecture diagram for AI Voice Sales Agent
"""
from PIL import Image, ImageDraw, ImageFont
import textwrap

# Create a large canvas
width = 1200
height = 1800
img = Image.new('RGB', (width, height), color='white')
draw = ImageDraw.Draw(img)

# Define colors
primary_blue = (59, 130, 246)
secondary_blue = (147, 197, 253)
dark_blue = (30, 58, 138)
green = (34, 197, 94)
orange = (249, 115, 22)
red = (239, 68, 68)
purple = (168, 85, 247)
gray = (107, 114, 128)
light_gray = (243, 244, 246)

# Try to load a font, fallback to default if not available
try:
    title_font = ImageFont.truetype("arial.ttf", 28)
    subtitle_font = ImageFont.truetype("arial.ttf", 20)
    text_font = ImageFont.truetype("arial.ttf", 16)
    small_font = ImageFont.truetype("arial.ttf", 12)
except:
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    text_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# Draw title
draw.text((width//2, 30), "AI Voice Sales Agent - Architecture", 
          fill=dark_blue, font=title_font, anchor='mm')

# Main flow boxes
box_width = 300
box_height = 60
x_center = width // 2 - box_width // 2
y_start = 80
y_gap = 90

# Define the main flow boxes
flow_boxes = [
    ("User/Lead Phone", primary_blue),
    ("Exotel Outbound Call", secondary_blue),
    ("AI Voice Conversation", primary_blue),
    ("Speech-to-Text / Language Understanding", secondary_blue),
    ("Lead Qualification", primary_blue),
    ("Actions During Call", secondary_blue),
    ("Post-Call Summary", primary_blue),
    ("WhatsApp Follow-up", secondary_blue)
]

# Draw main flow
y_pos = y_start
for box_text, color in flow_boxes:
    # Draw box
    draw.rectangle([x_center, y_pos, x_center + box_width, y_pos + box_height], 
                   fill=color, outline=dark_blue, width=2)
    # Draw text
    draw.text((x_center + box_width//2, y_pos + box_height//2), box_text,
              fill='white', font=text_font, anchor='mm')
    # Draw arrow down
    if y_pos < y_start + (len(flow_boxes) - 1) * y_gap:
        arrow_y = y_pos + box_height + 10
        draw.polygon([x_center + box_width//2, arrow_y,
                      x_center + box_width//2 - 10, arrow_y - 10,
                      x_center + box_width//2 + 10, arrow_y - 10],
                     fill=dark_blue)
    y_pos += y_gap

# Draw qualification branches
qual_y = y_start + 4 * y_gap + box_height // 2
branch_x_start = x_center + box_width + 20
branch_y = qual_y - 30

# HOT branch
hot_x = branch_x_start
hot_y = branch_y - 80
draw.rectangle([hot_x, hot_y, hot_x + 180, hot_y + 50], 
               fill=green, outline=dark_blue, width=2)
draw.text((hot_x + 90, hot_y + 25), "HOT → WhatsApp", 
          fill='white', font=text_font, anchor='mm')
draw.line([x_center + box_width, qual_y, hot_x, hot_y + 25], 
          fill=dark_blue, width=2)

# WARM branch
warm_x = branch_x_start
warm_y = branch_y
draw.rectangle([warm_x, warm_y, warm_x + 180, warm_y + 50], 
               fill=orange, outline=dark_blue, width=2)
draw.text((warm_x + 90, warm_y + 25), "WARM → Callback", 
          fill='white', font=text_font, anchor='mm')
draw.line([x_center + box_width, qual_y, warm_x, warm_y + 25], 
          fill=dark_blue, width=2)

# COLD branch
cold_x = branch_x_start
cold_y = branch_y + 80
draw.rectangle([cold_x, cold_y, cold_x + 180, cold_y + 50], 
               fill=red, outline=dark_blue, width=2)
draw.text((cold_x + 90, cold_y + 25), "COLD → Follow-up", 
          fill='white', font=text_font, anchor='mm')
draw.line([x_center + box_width, qual_y, cold_x, cold_y + 25], 
          fill=dark_blue, width=2)

# Draw infrastructure section
infra_y = y_start + 8 * y_gap + 50
draw.text((width//2, infra_y), "Infrastructure & Technologies", 
          fill=dark_blue, font=subtitle_font, anchor='mm')

infra_boxes = [
    ("FastAPI Backend", primary_blue, 50),
    ("PostgreSQL", secondary_blue, 200),
    ("Twilio WhatsApp", green, 350),
    ("Render Deployment", orange, 500),
    ("Vercel Frontend", purple, 650),
]

infra_box_y = infra_y + 40
for text, color, offset_x in infra_boxes:
    bx = offset_x
    by = infra_box_y
    draw.rectangle([bx, by, bx + 140, by + 50], 
                   fill=color, outline=dark_blue, width=2)
    draw.text((bx + 70, by + 25), text,
              fill='white', font=text_font, anchor='mm')

# Draw language support section
lang_y = infra_box_y + 100
draw.text((width//2, lang_y), "Language Support", 
          fill=dark_blue, font=subtitle_font, anchor='mm')

lang_box_y = lang_y + 40
lang_colors = [primary_blue, secondary_blue, green]
languages = ["English", "Hindi", "Telugu"]
lang_x_start = width//2 - 200

for i, (lang, color) in enumerate(zip(languages, lang_colors)):
    lx = lang_x_start + i * 200
    ly = lang_box_y
    draw.rectangle([lx, ly, lx + 120, ly + 40], 
                   fill=color, outline=dark_blue, width=2)
    draw.text((lx + 60, ly + 20), lang,
              fill='white', font=text_font, anchor='mm')

# Draw WhatsApp follow-up details
details_y = lang_box_y + 80
details_text = "WhatsApp Follow-up includes:"
draw.text((50, details_y), details_text, fill=dark_blue, font=text_font)

detail_items = [
    "• Conversation context",
    "• Lead qualification result",
    "• Resume/CV attachment",
    "• Mobile number",
    "• Architecture diagram"
]

for i, item in enumerate(detail_items):
    draw.text((70, details_y + 30 + i * 25), item, fill=gray, font=small_font)

# Save the image
output_path = "c:\\Users\\Sreevalli\\Downloads\\ai-voice-sales-agent\\backend\\docs\\architecture.png"
img.save(output_path, 'PNG', quality=95)
print(f"Architecture diagram saved to: {output_path}")
