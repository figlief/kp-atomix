from util import *

link_tpl = '    <a href="{0}.html">{0}</a>&nbsp;\n'

html_tpl = read("best.tpl.html")

links = []
for levelSet in levelSets:
    links.append(link_tpl.format(levelSet))
links = ''.join(links)

for levelSet in levelSets:
    fn = join(sdir, levelSet + ".html")
    txt = html_tpl.format(**locals())
    print fn
    write(fn, txt)
