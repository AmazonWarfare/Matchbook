import pywikibot
import pprint
from pywikibot import pagegenerators

pp = pprint.PrettyPrinter(indent=4)


site = pywikibot.Site('en', 'wikipedia')
page = pywikibot.Page(site, 'List of fantasy novels (A-H)')
print(page.text)
#page = pywikibot.Page(site, "List of fantasy novels (A-H)")
#cat = pywikibot.Category(site,'Category:Fantasy books')
"""
gen = pagegenerators.InterwikiPageGenerator(page)
for page in gen:
    #Do something with the page object, for example:
    text = page.text
    pp.pprint(text)
    """