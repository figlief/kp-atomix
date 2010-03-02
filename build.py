import sys, os

PROJECT = 'atomix'
XAG = 'xag'

def main():

    jsMain = '%s.js' % PROJECT
    jsLib = '%s_xlib.js' % PROJECT
    jsMin = '%s_min.js' % PROJECT


    tmp = 'TMP_%s_MIN.JS' % PROJECT

    os.system('%s %s'%(XAG, PROJECT))


    fp = open(jsLib, 'rb')
    txt = fp.read()
    fp.close()

    fp = open(jsLib, 'wb')
    fp.write(txt.replace('\r', ''))
    fp.close()

    if 0:
        txt += open(jsMain, 'rb').read()

        fp = open(tmp, 'wb')
        fp.write(txt)
        fp.close()

        os.system('compress --type js levels/katomic.js > levels/katomic_min.js')
        os.system('compress --type js %s > %s' % (tmp, jsMin))

        os.system('rm %s' % tmp)


if __name__ == "__main__":
   main()
