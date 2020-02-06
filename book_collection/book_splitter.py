import PyPDF2 
import reportlab
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet

file_name = str(input())
input_file = open(file_name, "rb")
#input_reader = PyPDF2.PdfFileReader(input_file)
count = 0
stylesheet = getSampleStyleSheet()

new_split = input_file.read(50000)
print(new_split.rfind("\n"))
split = new_split[0:new_split.rfind("\n")]
append = new_split[new_split.rfind("\n")]
while (split) and (count < 60):
    new_filename = "pdf_collect/" + file_name + str(count) + ".pdf"
    doc = SimpleDocTemplate(str(new_filename),  \
                        rightMargin=40, leftMargin=40, \
                        topMargin=40, bottomMargin=25, \
                        pageSize=A4)
    #doc.pagesize = portrait(A4)
    elements = []
    split_paragraphs = split.split("\n")
    for para in split_paragraphs:  
        para1 = '<font face="Courier" >%s</font>' % para 
        elements.append(Paragraph(para1, style=stylesheet['Normal']))
    doc.build(elements)
    #output_file = open(new_filename, "wb")
    #pdfWriter = PyPDF2.PdfFileWriter()
    #page =  PageObject.createBlankPage()
    #page.
    #output_file.write(split)
    new_split = append + input_file.read(50000-len(append))
    split = new_split[0:new_split.rfind("\n")]
    append = new_split[new_split.rfind("\n")]
    #output_file.close()
    count += 1
input_file.close()
