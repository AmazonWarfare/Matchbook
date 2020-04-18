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
start_of_entry = input_file.readline().strip()
while start_of_entry:
    new_filename = "gr_collect/" + start_of_entry + ".json"

    title = input_file.readline().strip()
    print(title)

    Author = input_file.readline().strip()

    count = 0
    genre = []
    new_genre = input_file.readline().strip()
    while new_genre != '#':
        genre.append(new_genre.replace('\n', ''))
        new_genre = input_file.readline().strip()
        count += 1

    count = 0
    tags = []
    new_line = input_file.readline().strip()
    while new_line != '#':
        new_tag = {}
        new_tag["tag_name"] = [new_line]
        new_tag["tag_type"] = [1]
        tags.append(new_tag)
        new_line = input_file.readline().strip()
        count += 1

    count = 0
    new_line = input_file.readline().strip()
    while new_line != '#':
        new_tag = {}
        new_tag["tag_name"] = [new_line]
        new_tag["tag_type"] = [2]
        tags.append(new_tag)
        new_line = input_file.readline().strip()
        count += 1

    count = 0
    new_line = input_file.readline().strip()
    while new_line != '#':
        new_tag = {}
        new_tag["tag_name"] = [new_line]
        new_tag["tag_type"] = [3]
        tags.append(new_tag)
        new_line = input_file.readline().strip()
        count += 1

    numBooks = 0
    #series = False
    series = "no"
    seriesLine = input_file.readline().strip()
    comma = seriesLine.rfind(",")
    if comma > -1:
        numBooks = int(seriesLine[seriesLine.rfind(",")+1:len(seriesLine)])
        #series = True
        series = "yes"

    adaptedLine = input_file.readline().strip()
    """
    if adaptedLine == "yes":
        adapted = True
    else:
        adapted = False
    """

    count = 0
    quotes = []
    new_quote = input_file.readline().strip()
    while new_quote != '#':
        if new_quote.endswith('\''):
            quotes.append(new_quote)
        else:
            quote = ""
            while not new_quote.endswith('\''):
                quote += new_quote
                new_quote = input_file.readline().strip()
            quote += new_quote
            quotes.append(quote)
        new_quote = input_file.readline().strip()
        count += 1

    rating = input_file.readline().strip()

    numPages = input_file.readline().strip()

    next_line = input_file.readline().strip()
    gr_synopsis = ""
    while next_line != '#':
        gr_synopsis += next_line
        next_line = input_file.readline().strip().replace('\n', ' ')

    next_line = input_file.readline().strip()
    wiki_synopsis = ""
    while next_line != '#':
        wiki_synopsis += next_line
        next_line = input_file.readline().strip().replace('\n', ' ')

    data = {}
    data["title"] = []
    data['title'].append(title)
    data["author"] = []
    data['author'].append(Author)
    data["genre"] = []
    data['genre'].append(genre)
    data["tags"] = []
    data['tags'] = (tags)
    data["series"] = []
    data['series'].append(series)
    if series == "yes":
        data['number_of_books'] = []
        data['number_of_books'].append(numBooks)
    data["adapted"] = []
    data['adapted'].append(adaptedLine)
    data["quotes"] = []
    data['quotes'].append(quotes)
    data["rating"] = []
    data['rating'].append(rating)
    data['number_of_pages'] = []
    data['number_of_pages'].append(numPages)
    data["good_reads_synopsis"] = []
    data['good_reads_synopsis'].append(gr_synopsis)
    data["text"] = []
    data['text'].append(wiki_synopsis)

    with open(new_filename, 'w') as outfile:
        json.dump(data, outfile)

    start_of_entry = input_file.readline().strip()
