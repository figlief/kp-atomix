"""Convert katomic levels to kp-atomix format."""

import os, re
import json

src = "/usr/share/kde4/apps/katomic/levels"
dest = "/home/kp/hg/kp-atomix/levels/katomic.js"

levels = []

def r(s):
    return re.compile(s, re.MULTILINE)

reName = r('^Name=(.*)')
reAtoms = r('^atom_(.)=(.)-(.*)$')
reArena = r('^feld_\d\d=(\.*)(.*?)(\.*)$')
reMole = r('^mole_\d+=(.*)$')

for fn in  sorted([int(fn.split('_')[1]) for fn in os.listdir(src)]):

    fp = open(os.path.join(src, 'level_%s'%fn), 'r')
    text = fp.read()
    fp.close()

    out = [
      '{',
      '  "id": "k%s",' % fn,
      '  "name": "%s",' % reName.search(text).group(1),
      '  "atoms": {'
    ]
    a = out.append

    a(',\n'.join(
        ['    "%s": ["%s", "%s"]' % m.groups() for m in reAtoms.finditer(text)]
    ))
    a('  },')

    a('  "arena" : [')
    arena = []
    maxpre = 999
    maxpost = 999
    for m in reArena.finditer(text):
        line = m.group(2)
        if '#' not in line:
            continue
        arena.append('%s%s%s'%m.groups())
        maxpre = min(maxpre, len(m.group(1)))
        maxpost = min(maxpost, len(m.group(3)))

    if maxpost:
        arena = [ s[:-maxpost] for s in arena ]
    if maxpre:
        arena = [ s[maxpre:] for s in arena ]

    arena = ['    "%s"'%s for s in arena]

    a(',\n'.join(arena))
    a('  ],')

    a('  "molecule": [')
    a(',\n'.join(
        ['    "%s"'%m.group(1) for m in reMole.finditer(text) ]
    ))
    a('  ]')

    a('}')

    levels.append('\n'.join(out))

fp = open(dest, 'w')

fp.write("""/*
 * The contents of this file is derived from the KDE project "KAtomic"
 *
 * http://games.kde.org/game.php?game=katomic
 * http://www.gnu.org/licenses/gpl.html
 *
 * KAtomic is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2, or (at your option)
 * any later version.
 *
 * KAtomic is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with KAtomic; see the file COPYING.  If not, write to
 * the Free Software Foundation, 51 Franklin Street, Fifth Floor,
 * Boston, MA 02110-1301, USA.
 *
*/

KP_ATOMIX.levels["katomic"] = [

""")

fp.write(',\n'.join(levels) + ']')
fp.close()
