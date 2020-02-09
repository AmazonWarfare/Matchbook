import sys
import os
import reportlab
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.pdfgen import canvas

if not os.path.exists("pdf_collect"):
    os.mkdir("pdf_collect")
    print("Directory pdf_collect folder created storing split book there")
else:    
    print("Directory  pdf_collect already exists storing split book there")

file_name = str(sys.argv[1])
input_file = open(file_name, "rb")
Author = str(sys.argv[2])
count = 0
stylesheet = getSampleStyleSheet()

new_split = input_file.read(50000)
split = new_split[0:new_split.rfind("\n")]
append = new_split[new_split.rfind("\n")]
while (split) and (count < 100):
    new_filename = "pdf_collect/" + file_name + str(count) + ".pdf"
    doc = SimpleDocTemplate(str(new_filename),  \
                        rightMargin=40, leftMargin=40, \
                        topMargin=40, bottomMargin=25, \
                        pageSize=A4, title=file_name, author=Author)
    elements = []
    split_paragraphs = split.split("\n")
    for para in split_paragraphs:  
        para1 = '<font face="Courier" >%s</font>' % para 
        elements.append(Paragraph(para1, style=stylesheet['Normal']))
    doc.build(elements)
    new_split = append + input_file.read(50000-len(append))
    split = new_split[0:new_split.rfind("\n")]
    append = new_split[new_split.rfind("\n")]
    count += 1
input_file.close()
print("Split into " + str(count) + " pdf files")