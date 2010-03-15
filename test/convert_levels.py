"""Convert katomic levels to kp-atomix format."""

import os, sys, re, cPickle
import sqlite3 as sqlite
import json


src = "/usr/share/kde4/apps/katomic/levels"
dest = "../levels/katomic"

dest_js = dest + '.js'
dest_sql = 'test.db'

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

    level = {
        "id": "k%s" % fn,
        "name": "%s" % reName.search(text).group(1)
    }

    atoms = level['atoms']  = [
        m.groups() for m in reAtoms.finditer(text)
    ]

    arena =  []
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

    level['arena'] = arena

    mol = [ m.group(1) for m in reMole.finditer(text) ]
    maxmol = max([len(m) for m in mol])
    dots = '.' * maxmol
    for i, s in enumerate(mol[:]):
        mol[i] = (s + dots)[:maxmol]

    level['molecule'] = mol

    levels.append(level)

def toJS(levels):

    outlevels = []
    for level in  levels:

        out = [
          '{',
          '  "id": "%s",' % level['id'],
          '  "name": "%s",' % level['name'],
          '  "atoms": {'
        ]
        a = out.append

        a(',\n'.join(
            ['    "%s": ["%s", "%s"]' % m  for m in level['atoms'] ]
        ))
        a('  },')

        a('  "arena" : [')

        arena = ['    "%s"'%s for s in level['arena']]

        a(',\n'.join(arena))
        a('  ],')

        a('  "molecule": [')
        a(',\n'.join(
            ['    "%s"' % m for m in level['molecule'] ]
        ))
        a('  ]')

        a('}')

        outlevels.append('\n'.join(out))

    return outlevels

def toSQL(levels):

    if os.path.exists(dest_sql):
        os.system('rm %s' % dest_sql)

    conn = sqlite.connect(dest_sql)
    cur = conn.execute('create table levels (levelset text, id text, name text, data text)')

    for level in  levels:
        cur.execute("""
            INSERT INTO levels (levelset, id, name, data)
            VALUES ( "katomic", ?, ?, ? )
            """, ( level['id'], level['name'], json.dumps(level) )
        )
    conn.commit()
    cur.close()

fp = open(dest_js, 'w')

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

fp.write(',\n'.join(toJS(levels)) + ']')
fp.close()

toSQL(levels)
