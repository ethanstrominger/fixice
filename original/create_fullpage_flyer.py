from PyPDF2 import PdfReader, PdfWriter, Transformation
from PyPDF2.errors import PdfReadError
halfpage_path = "dist/halfpageflyer.pdf"
output_path = "dist/halfpageflyer_fullpage.pdf"

try:
    reader = PdfReader(halfpage_path)
    page = reader.pages[0]
except (PdfReadError, FileNotFoundError) as e:
    print(f"Error reading {halfpage_path}: {e}")
    exit(1)

# 8.5 x 11 inches in points
PAGE_WIDTH = 8.5 * 72
PAGE_HEIGHT = 11 * 72
HALF_HEIGHT = PAGE_HEIGHT / 2

writer = PdfWriter()

# Create a blank page
new_page = writer.add_blank_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)

# Place the flyer at the top
import copy
top_page = copy.deepcopy(page)
top_page.add_transformation(Transformation().translate(tx=0, ty=HALF_HEIGHT))
new_page.merge_page(top_page)
# Place the flyer at the bottom
bottom_page = copy.deepcopy(page)
bottom_page.add_transformation(Transformation().translate(tx=0, ty=0))
new_page.merge_page(bottom_page)

with open(output_path, "wb") as f:
    writer.write(f)

print(f"Created {output_path}")
