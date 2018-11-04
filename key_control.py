#!/usr/bin/python3
import _thread
import time
from http.server import BaseHTTPRequestHandler, HTTPServer, ThreadingHTTPServer
from pathlib import Path
import mimetypes
import os
import socket
from virtual_keyboard import *
from shutdown_cross import *

if os.name != "nt":
    import fcntl
    import struct

    def get_interface_ip(ifname):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        return socket.inet_ntoa(fcntl.ioctl(s.fileno(), 0x8915, struct.pack('256s',
                                ifname[:15]))[20:24])

def get_lan_ip():
    ip = socket.gethostbyname(socket.gethostname())
    if ip.startswith("127.") and os.name != "nt":
        interfaces = [
            "eth0",
            "eth1",
            "eth2",
            "wlan0",
            "wlan1",
            "wifi0",
            "ath0",
            "ath1",
            "ppp0",
            ]
        for ifname in interfaces:
            try:
                ip = get_interface_ip(ifname)
                break
            except IOError:
                pass
    return ip
	
print(get_lan_ip())
mimetypes.init()

PORT = 80

class S(BaseHTTPRequestHandler):
	def _set_headers(self, file_name = '.html'):
		self.send_response(200)
		self.send_header('Content-type', mimetypes.guess_type(file_name)[0])
		self.end_headers()
	def _set_headers_notfound(self, file_name = '.html'):
		self.send_response(404)
		self.send_header('Content-type', mimetypes.guess_type(file_name)[0])
		self.end_headers()
	def do_GET(self):
		print(self.path)
		if self.path == '/':
			get_path = 'index.html'
		else:
			get_path = self.path[1:]
		my_file = Path(get_path)
		if my_file.is_file():
			with open(my_file) as f:
				read_data = f.read()
				self._set_headers(get_path)
				self.wfile.write(str.encode(read_data))
		elif 'id_key.' in self.path:
			key = self.path.split('.')[-1]
			print('key pressed: \n' + key)
			self._set_headers()
			KeyPress(key)
			self.wfile.write(str.encode('ok'))
		elif 'id_charkey.' in self.path:
			key = self.path.split('.')[-1]
			print('key pressed: \n' + key)
			if 'VK_SHIFT' or 'VK_CONTROL' in key:
				ctrl_key = key[:-2]
				char_key = key[-1]
				print(ctrl_key, char_key)
				KeyPressWith(ctrl_key, ord(char_key))
			else:
				charKeyPress(ord(key))
			self._set_headers()
			self.wfile.write(str.encode('ok'))
		elif 'id_shutdown' in self.path:
			print('key pressed: shutdown\n')
			self._set_headers()
			self.wfile.write(str.encode('ok'))
			#shutDown()
			os.system('shutdown -t 0 -s')
		elif 'id_reboot' in self.path:
			print('key pressed: reboot\n')
			self._set_headers()
			self.wfile.write(str.encode('ok'))
			#shutDown()
			os.system('shutdown -t 0 -r -f')#system("shutdown -t 0 -r -f")
		else:
			self._set_headers_notfound()
			self.wfile.write(str.encode('not found'))

	def do_HEAD(self):
		self._set_headers()
		
	def do_POST(self):
		# Doesn't do anything with posted data
		self._set_headers()
		self.wfile.write(str.encode('<html><body><h1>POST!</h1></body></html>'))

def run(server_class=ThreadingHTTPServer, handler_class=S, port=PORT):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('\nStarting httpd...\n')
    httpd.serve_forever()

_thread.start_new_thread ( run,() )

input('Press anykey to exit.') 