from os.path import (abspath, join, split)

base = split(abspath(__file__))[0]

sdir = abspath(join(base, '..',  'solutions'))

levelSets = ('draknek', 'katomic', 'mystery', 'original', 'pack1')


def read(fn):
    with open(fn, 'rb') as fp:
        txt = fp.read()
    return txt.decode('utf-8')


def write(fn, text):
    with open(fn, 'wb') as fp:
        fp.write(text.encode('utf-8'))
