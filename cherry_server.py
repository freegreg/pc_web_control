# -*- coding: utf-8 -*-
import os, os.path
import random
import string
import simplejson

from virtual_keyboard import *
from get_lan_ip import *

import cherrypy

import os, string
available_drives = ['%s:' % d for d in string.ascii_uppercase if os.path.exists('%s:' % d)]

class remoteControlSever(object):
	@cherrypy.expose
	def index(self):
		return open('index.html')
	
	@cherrypy.expose
	def pressKey(self, **params):
		print(params['button'])
		keys = params['button']
		if not isinstance(keys, list):
			keys = [keys]
		KeysPress(keys)
		
	@cherrypy.expose
	def pcShutdown(self):
		print('key pressed: shutdown\n')
		os.system('shutdown -t 0 -s')
	
	@cherrypy.expose
	def pcReboot(self):
		print('key pressed: reboot\n')
		os.system('shutdown -t 0 -r -f')#system("shutdown -t 0 -r -f")
		
	@cherrypy.expose
	def getPath(self, path):
		folder_structure = {'folders':[], 'files':[]}
		print(path)
		if path == 'root':
			folder_structure['folders'].extend(available_drives)
		else:
			for (dirpath, dirnames, filenames) in os.walk(path):
				folder_structure['folders'].extend(dirnames)
				folder_structure['files'].extend(filenames)
				break
		cherrypy.response.headers['Content-Type'] = 'application/json'
		print(folder_structure)
		return simplejson.dumps(folder_structure).encode('utf-8')
	
if __name__ == '__main__':
	conf = {
		'/': {
			'tools.sessions.on': True,
			'tools.staticdir.root': os.path.abspath(os.getcwd()),
			'tools.staticdir.on': True,
            'tools.staticdir.dir': os.path.abspath(os.getcwd()),
			'tools.encode.on': True,
			'tools.encode.encoding': 'utf-8'
		}
    }
	local_ip = get_lan_ip('192.168.1')
	print(local_ip)
	cherrypy.config.update({'server.socket_host': local_ip, 'server.socket_port': 80})
	cherrypy.quickstart(remoteControlSever(), '/', conf)