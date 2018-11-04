import ctypes
from ctypes import wintypes
import time
import re

user32 = ctypes.WinDLL('user32', use_last_error=True)

INPUT_MOUSE    = 0
INPUT_KEYBOARD = 1
INPUT_HARDWARE = 2

KEYEVENTF_EXTENDEDKEY = 0x0001
KEYEVENTF_KEYUP       = 0x0002
KEYEVENTF_UNICODE     = 0x0004
KEYEVENTF_SCANCODE    = 0x0008

MAPVK_VK_TO_VSC = 0

# msdn.microsoft.com/en-us/library/dd375731
vk_keys = {}
vk_keys['VK_TAB']  			= 		0x09
vk_keys['VK_MENU']				= 	0x12
vk_keys['VK_VOLUME_DOWN'] 		= 	0xAE
vk_keys['VK_VOLUME_UP'] 		= 	0xAF
vk_keys['VK_LEFT'] 			= 		0x25 #LEFT ARROW key
vk_keys['VK_UP'] 				= 	0x26 #UP ARROW key
vk_keys['VK_RIGHT'] 			= 	0x27 #RIGHT ARROW key
vk_keys['VK_DOWN'] 			= 		0x28 #DOWN ARROW key
vk_keys['VK_SPACE']			= 		0x20
#For media/youtube
vk_keys['VK_VOLUME_MUTE'] =			0xAD	#Volume Mute key
vk_keys['VK_VOLUME_DOWN'] =			0xAE	#Volume Down key
vk_keys['VK_VOLUME_UP'] =			0xAF	#Volume Up key
vk_keys['VK_MEDIA_NEXT_TRACK'] =	0xB0	#Next Track key
vk_keys['VK_MEDIA_PREV_TRACK'] =	0xB1	#Previous Track key
vk_keys['VK_MEDIA_STOP'] =			0xB2	#Stop Media key
vk_keys['VK_MEDIA_PLAY_PAUSE'] =	0xB3	#Play/Pause Media key
vk_keys['VK_SHIFT'] =				0x10	#SHIFT key
vk_keys['VK_CONTROL'] =				0x11	#CTRL key
#digits and numbers = ascii

# C struct definitions

wintypes.ULONG_PTR = wintypes.WPARAM

class MOUSEINPUT(ctypes.Structure):
    _fields_ = (("dx",          wintypes.LONG),
                ("dy",          wintypes.LONG),
                ("mouseData",   wintypes.DWORD),
                ("dwFlags",     wintypes.DWORD),
                ("time",        wintypes.DWORD),
                ("dwExtraInfo", wintypes.ULONG_PTR))

class KEYBDINPUT(ctypes.Structure):
    _fields_ = (("wVk",         wintypes.WORD),
                ("wScan",       wintypes.WORD),
                ("dwFlags",     wintypes.DWORD),
                ("time",        wintypes.DWORD),
                ("dwExtraInfo", wintypes.ULONG_PTR))

    def __init__(self, *args, **kwds):
        super(KEYBDINPUT, self).__init__(*args, **kwds)
        # some programs use the scan code even if KEYEVENTF_SCANCODE
        # isn't set in dwFflags, so attempt to map the correct code.
        if not self.dwFlags & KEYEVENTF_UNICODE:
            self.wScan = user32.MapVirtualKeyExW(self.wVk,
                                                 MAPVK_VK_TO_VSC, 0)

class HARDWAREINPUT(ctypes.Structure):
    _fields_ = (("uMsg",    wintypes.DWORD),
                ("wParamL", wintypes.WORD),
                ("wParamH", wintypes.WORD))

class INPUT(ctypes.Structure):
    class _INPUT(ctypes.Union):
        _fields_ = (("ki", KEYBDINPUT),
                    ("mi", MOUSEINPUT),
                    ("hi", HARDWAREINPUT))
    _anonymous_ = ("_input",)
    _fields_ = (("type",   wintypes.DWORD),
                ("_input", _INPUT))

LPINPUT = ctypes.POINTER(INPUT)

def _check_count(result, func, args):
    if result == 0:
        raise ctypes.WinError(ctypes.get_last_error())
    return args

user32.SendInput.errcheck = _check_count
user32.SendInput.argtypes = (wintypes.UINT, # nInputs
                             LPINPUT,       # pInputs
                             ctypes.c_int)  # cbSize

# Functions

def PressKey(hexKeyCode):
    x = INPUT(type=INPUT_KEYBOARD,
              ki=KEYBDINPUT(wVk=hexKeyCode))
    user32.SendInput(1, ctypes.byref(x), ctypes.sizeof(x))

def ReleaseKey(hexKeyCode):
    x = INPUT(type=INPUT_KEYBOARD,
              ki=KEYBDINPUT(wVk=hexKeyCode,
                            dwFlags=KEYEVENTF_KEYUP))
    user32.SendInput(1, ctypes.byref(x), ctypes.sizeof(x))

def AltTab():
    """Press Alt+Tab and hold Alt key for 2 seconds
    in order to see the overlay.
    """
    PressKey(VK_MENU)   # Alt
    PressKey(VK_TAB)    # Tab
    ReleaseKey(VK_TAB)  # Tab~
    time.sleep(2)
    ReleaseKey(VK_MENU) # Alt~

def VolumeUp():
	PressKey(vk_keys['VK_VOLUME_UP'])   # Alt
	ReleaseKey(vk_keys['VK_VOLUME_UP']) # Alt~
	
def VolumeDown():
	PressKey(vk_keys['VK_VOLUME_DOWN'])   # Alt
	ReleaseKey(vk_keys['VK_VOLUME_DOWN']) # Alt~


def charKeyPress(char):
	key = char.upper()
	if len(key) == 1 and ((ord(key) >= 0x30 and ord(key) <= 0x39) or (ord(key) >= 0x41 and ord(key) <= 0x5A)):
		PressKey(key)   # Alt
		ReleaseKey(key) # Alt~

def KeyPressWith(ctrl_key, char_key):
	PressKey(vk_keys[ctrl_key])
	PressKey(char_key)
	ReleaseKey(char_key)
	ReleaseKey(vk_keys[ctrl_key])
	
def KeyPress(key):
	PressKey(vk_keys[key])   # Alt
	ReleaseKey(vk_keys[key]) # Alt~
	
