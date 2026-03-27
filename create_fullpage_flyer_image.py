from pdf2image import convert_from_path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

halfpage_path = "dist/halfpageflyer.pdf"
output_path = "dist/halfpageflyer_fullpage_image.pdf"
tmp_image = "dist/_tmp_halfpage.png"

# Convert the first page of the PDF to an image
images = convert_from_path(halfpage_path, dpi=300, first_page=1, last_page=1)
images[0].save(tmp_image, 'PNG')

# Get image size in pixels
img_width, img_height = images[0].size

# Calculate scaling to fit 8.5x5.5 inches at 300 dpi
inch = 72
page_width, page_height = letter
half_height = page_height / 2

# Create a new PDF with the image placed twice
c = canvas.Canvas(output_path, pagesize=letter)

# Draw image at the top
c.drawImage(tmp_image, 0, half_height, width=page_width, height=half_height)
# Draw image at the bottom
c.drawImage(tmp_image, 0, 0, width=page_width, height=half_height)

c.save()
os.remove(tmp_image)
print(f"Created {output_path}")
