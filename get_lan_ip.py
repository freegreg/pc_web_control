import socket
import os

if os.name != "nt":
    import fcntl
    import struct

    def get_interface_ip(ifname):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        return socket.inet_ntoa(fcntl.ioctl(s.fileno(), 0x8915, struct.pack('256s',
                                ifname[:15]))[20:24])

def get_lan_ip(mask):
	ips = socket.gethostbyname_ex(socket.gethostname())[-1]
	ip = socket.gethostbyname_ex(socket.gethostname())[-1][0]#socket.gethostbyname(socket.gethostname())
	for ip_ in ips:
		if mask in ip_:
			ip = ip_
			break
	
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