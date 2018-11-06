import os, os.path
import random
import string

from virtual_keyboard import *
from get_lan_ip import *

import cherrypy

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

if __name__ == '__main__':
	conf = {
		'/': {
			'tools.sessions.on': True,
			'tools.staticdir.root': os.path.abspath(os.getcwd()),
			'tools.staticdir.on': True,
            'tools.staticdir.dir': os.path.abspath(os.getcwd())
		}
    }
	local_ip = get_lan_ip()
	print(get_lan_ip())
	cherrypy.config.update({'server.socket_host': local_ip, 'server.socket_port': 80})
	cherrypy.quickstart(remoteControlSever(), '/', conf)