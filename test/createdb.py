import os
import sqlite3 as sqlite

db = os.path.abspath(os.path.join(__file__, '..', '..', 'cgi-bin', 'atomix-moves.db'))
print db, '###################'


if os.path.exists(db):
    os.system('rm %s' % db)

conn = sqlite.connect(db)
cur = conn.execute("""
    create table moves (
        id text,
        date text,
        user text,
        levelset text,
        level text,
        nMoves integer,
        solution text
    )"""
)
conn.commit()
