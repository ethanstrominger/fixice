from pdfrw import PdfReader, PdfWriter, PageMerge
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

halfpage_path = "dist/halfpageflyer.pdf"
output_path = "dist/halfpageflyer_fullpage_pdfrw.pdf"

# Read the half-page flyer
halfpage_pdf = PdfReader(halfpage_path)
halfpage = halfpage_pdf.pages[0]

# Create a blank 8.5x11 PDF with reportlab
rl_tmp = "dist/_tmp_fullpage.pdf"
c = canvas.Canvas(rl_tmp, pagesize=letter)
c.showPage()  # Ensure a page is finalized
c.save()      # Properly close the canvas

# Read the blank page
fullpage_pdf = PdfReader(rl_tmp)
fullpage = fullpage_pdf.pages[0]

# Place the half-page flyer at the top
merge_top = PageMerge(fullpage).add(halfpage, viewrect=(0, 0, 1, 1))
merge_top[0].y = 396  # 5.5 inches * 72 points
merge_top.render()
# Place the half-page flyer at the bottom
merge_bottom = PageMerge(fullpage).add(halfpage, viewrect=(0, 0, 1, 1))
merge_bottom[0].y = 0
merge_bottom.render()

# Write the output
writer = PdfWriter()
writer.addpage(fullpage)
writer.write(output_path)

os.remove(rl_tmp)
print(f"Created {output_path}")
