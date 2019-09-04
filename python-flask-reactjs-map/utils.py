
import time


def millis():
    return int(round(time.time() * 1000))


def enter(indent, name, message):
    debug(indent, name, '[ENTER] ' + message)


def exit(indent, name, result):
    debug(indent, name, '[EXIT]' if result == None else '[EXIT] ' + result)


def set_debug(value):

    return True


def debug(indent, name, message):

    string = ''

    for i in range(0, indent):
        string = string + '   '
        i

    print string + name + ' ' + message


def compare_numbers(num, other):
    if num < other:
        result = -1
    elif num > other:
        result = 1
    else:
        result = 0

    return result


def print_array_in_columns(count, columns, get_string):

    string = ''

    for i in range(0, count):
        mod = (i + 1) % columns

        if string != '':
            string += ' '

        string += get_string(i)

        if mod == 0 and i > 0:
            print string
            string = ''

    if string != '':
        print string

# comparison that takes float rounding errors into account


FLOAT_MARGIN = 0.0000001


def float_gt(number, other):
    return number - other > FLOAT_MARGIN


def float_lt(number, other):
    return other - number > FLOAT_MARGIN


def float_eq(number, other):
    return abs(number - other) < FLOAT_MARGIN
