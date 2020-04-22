import sys
import os
import json

if not os.path.exists("website_collect"):
    os.mkdir("website_collect")
    print("Directory website_collect folder created storing split book there")
else:    
    print("Directory  website_collect already exists storing split book there")

file_name = str(sys.argv[1])
input_name = "websites/" + file_name
input_file = open(input_name, "rb")
start_of_entry = input_file.readline().strip()
while start_of_entry:
    new_filename = "website_collect/" + start_of_entry + ".json"

    sitename = input_file.readline().strip()
    print(sitename)

    site_link = input_file.readline().strip()

    site_type = input_file.readline().strip()

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

    next_line = input_file.readline().strip()
    desc = ""
    while next_line != '#':
        desc += next_line
        next_line = input_file.readline().strip().replace('\n', ' ')

    data = {}
    data["sitename"] = []
    data['sitename'].append(sitename)
    data["site_link"] = []
    data['site_link'].append(site_link)
    data["site_type"] = []
    data['site_type'].append(site_type)
    data["tags"] = []
    data['tags'] = (tags)
    data['desc'] = []
    data['desc'].append(desc)
    data["text"] = []
    data['text'].append(desc)

    with open(new_filename, 'w') as outfile:
        json.dump(data, outfile)

    start_of_entry = input_file.readline().strip()
