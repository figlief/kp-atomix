import os
import requests

from os.path import (abspath, join, split)

base = split(abspath(__file__))[0]
sdir = abspath(join(base, '..',  'solutions'))

print ('write to', sdir)

url_base = "http://figlief.pythonanywhere.com/solutions/"


prefix = """if(!KP_ATOMIX){var KP_ATOMIX={}}
KP_ATOMIX.solutions = """

for levelset in ('katomic', 'mystery', 'original', 'pack1'):
    url = url_base + levelset + '.json'
    print url

    r = requests.get(url)
    r.raise_for_status()
    print r.status_code

    fn = join(sdir, levelset + ".js")
    txt = prefix + r.text
    with open(fn, "wb") as fp:
        fp.write(txt)

