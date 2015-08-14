import requests

from util import *


print ('write to', sdir)

url_base = "http://figlief.pythonanywhere.com/solutions/"


prefix = """if(!KP_ATOMIX){var KP_ATOMIX={}}
KP_ATOMIX.solutions = """

for levelset in levelSets:
    url = url_base + levelset + '.json'
    print url

    r = requests.get(url)
    r.raise_for_status()

    fn = join(sdir, levelset + ".js")
    txt = prefix + r.text
    write(fn, txt)
