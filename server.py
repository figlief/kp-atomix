#!/usr/bin/env python
import os
import CGIHTTPServer

class HandlerClass(CGIHTTPServer.CGIHTTPRequestHandler):
    pass

def serve():
    CGIHTTPServer.test(HandlerClass)

if __name__ == '__main__':
    path =  os.path.abspath(os.path.join(os.getcwd(), __file__, '..'))
    os.chdir(path)
    print 'Server Root:', os.getcwd()
    serve()
