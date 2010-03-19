#!/usr/bin/env python

import sys, os, uuid, cgi
import json, re

from datetime import datetime
#import cgitb; cgitb.enable()  # for troubleshooting

import sqlite3 as sqlite

db = os.path.abspath(os.path.join(__file__, '..', 'atomix-moves.db'))

print "Content-type: text/plain"
print


def doit():
    form = cgi.FieldStorage()
    user = form.getvalue("user", 'anonymous')
    levelSet = form.getvalue("levelSet", None)
    level = form.getvalue("level", None)
    solution = form.getvalue("solution", None)
    nmoves = len(solution.split(','))

    uid = uuid.uuid4().hex

    level = int(re.search(r'(\d+)',level).group(1))

    def get_levels():

        fp =  file('/home/kp/hg/kp-atomix/levels/%s.js' % levelSet)
        text = fp.read()
        fp.close()

        m = re.search( '(?s)KP_ATOMIX[^\n]+\n(.*)', text)
        text  ='[' + m.group(1)
        return json.loads(text)

    def check_solution():
        level = get_levels()[level]
        arena = level['arena']
        molecule = level['molecule']
        filler = '.' * (len(arena[0]) - len(molecule[0]))

        arena = ''.join(arena).replace('#', '.')
        molecule = filler.join(level['molecule'])

        return molecule in arena

    # print (uuid.uuid4().hex, str(datetime.utcnow()), user, levelSet, level, nmoves, solution)
    #print

    conn = sqlite.connect(db)
    cur = conn.execute(
        """insert into 'moves' values (?,?,?,?,?,?,? );
        """,
        (
            uid,       # id text
            str(datetime.utcnow()), # date text
            user,       # user text
            levelSet,   # levelset text
            level,      # level text
            nmoves,     # integer
            solution    # solution text
        )
    )
    conn.commit();
    return '%s,%s' % (uid, db)

response = 'fail'
uid = '0'
try:
   uid = doit()
   response = 'ok'
finally:

    print """%s,%s""" % (response, uid)
