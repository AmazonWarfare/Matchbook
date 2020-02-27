#python book_splitter_json.py filename title author genre
import sys
import os
import json

if not os.path.exists("gr_collect"):
    os.mkdir("gr_collect")
    print("Directory gr_collect folder created storing split book there")
else:    
    print("Directory  gr_collect already exists storing split book there")

file_name = str(sys.argv[1])
input_name = "good_reads/" + file_name
input_file = open(input_name, "rb")
new_filename = "synopsis_collect/" + input_file.readline() + ".json"

title = input_file.readline()

Author = input_file.readline()

count = 0
genre = []
new_genre = input_file.readline()
while new_genre != '#':
    genre[count] = new_genre
    new_genre = input_file.readline()
    count += 1

count = 0
tag1 = []
new_tag = input_file.readline()
while new_tag != '#':
    tag1[count] = new_tag
    new_tag = input_file.readline()
    count += 1

count = 0
tag2 = []
new_tag = input_file.readline()
while new_tag != '#':
    tag2[count] = new_tag
    new_tag = input_file.readline()
    count += 1

count = 0
tag3 = []
new_tag = input_file.readline()
while new_tag != '#':
    tag3[count] = new_tag
    new_tag = input_file.readline()
    count += 1

numBooks = 0
#series = False
series = "no"
seriesLine = input_file.readline()
comma = seriesLine.rfind(",")
if comma > -1:
    numBooks = int(series[seriesLine.rfind(",")])
    #series = True
    series = "yes"

adaptedLine = input_file.readline()
"""
if adaptedLine == "yes":
    adapted = True
else:
    adapted = False
"""

count = 0
quotes = []
new_quote = input_file.readline()
while new_quote != '#':
    if new_quote.endswith('\'')
        quotes[count] = new_quote
    else:
        while not new_quote.endswith('\''):
            quote += new_quote
            new_quote = input_file.readline()
        quotes[count] = quote
    new_quote = input_file.readline()
    count += 1

rating = input_file.readline()

numPages = input_file.readline()

next_line = input_file.readline()
gr_synopsis = ""
while next_line != '#':
    gr_synopsis += next_line
    next_line = input_file.readline()

next_line = input_file.readline()
wiki_synopsis = ""
while next_line != '#':
    wiki_synopsis += next_line
    next_line = input_file.readline()

data = {}
data["title"] = []
data['title'].append(title)
data["author"] = []
data['author'].append(Author)
data["genre"] = []
data['genre'].append(genre)
data["tags 1"] = []
data['tags 1'].append(tag1)
data["tags 2"] = []
data['tags 2'].append(tag2)
data["tags 3"] = []
data['tags 3'].append(tag3)
data["series"] = []
data['series'].append(series)
if series == "yes":
    data['number of books'] = []
    data['number of books'].append(numBooks)
data["adapted"] = []
data['adapted'].append(adaptedLine)
data["quotes"] = []
data['quotes'].append(quotes)
data["rating"] = []
data['rating'].append(quotes)
data['number of books'] = []
data['number of pages'].append(numPages)
data["good reads synopsis"] = []
data['good read synopsis'].append(gr_synopsis)
data["text"] = []
data['text'].append(wki_synopsis)
