#python book_splitter_json.py filename title author genre
import sys
import os
import reportlab
import json

if not os.path.exists("synopsis_collect"):
    os.mkdir("synopsis_collect")
    print("Directory synopsis_collect folder created storing split book there")
else:    
    print("Directory  synopsis_collect already exists storing split book there")

file_name = str(sys.argv[1])
input_name = "synopsis/" + file_name
input_file = open(input_name, "rb")
title = str(sys.argv[2])
Author = str(sys.argv[3])
genre = str(sys.argv[4])
count = 0

split = input_file.read(50000)
#split = new_split[0:new_split.rfind("\n")]
#append = new_split[new_split.rfind("\n")]
while (split) and (count < 100):
    new_filename = "synopsis_collect/" + file_name + str(count) + ".json"
    
    data = {}
    data["author"] = []
    data['author'].append(Author)
    data["title"] = []
    data['title'].append(title)
    data["genre"] = []
    data['genre'].append(genre)
    data["text"] = []
    data['text'].append(split)


    with open(new_filename, 'w') as outfile:
        json.dump(data, outfile)
    split = input_file.read(50000)
    #new_split = input_file.read(50000)
    #split = new_split[0:new_split.rfind("\n")]
    #append = new_split[new_split.rfind("\n")]
    count += 1
input_file.close()
print("Split into " + str(count) + " pdf files")