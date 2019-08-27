
import time


def millis():
    return int(round(time.time() * 1000))


def enter(indent, name, message):
    debug(indent, name, '[ENTER] ' + message)


def exit(indent, name, result):
    debug(indent, name, '[EXIT] ' + result)


def debug(indent, name, message):

    string = ''

    for i in range(0, indent):
        string = string + '   '
        i

    print string + name + ' ' + message
