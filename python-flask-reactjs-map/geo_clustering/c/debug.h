#ifndef DEBUG_H
#define DEBUG_H

#define DEBUG 1

typedef char indent_t;

#if (DEBUG == 1)
#   define debug_(indent, format) _debug("DEBUG", __FUNCTION__, indent, format)
#   define debug(indent, format, ...) _debug("DEBUG", __FUNCTION__, indent, format, __VA_ARGS__)
#   define enter(indent, format, ...) _debug("ENTER", __FUNCTION__, indent, format, __VA_ARGS__)
#   define exit(indent, format, ...)  _debug("EXIT",  __FUNCTION__, indent, format, __VA_ARGS__)
#else
#   define debug(indent, format, ...)
#   define enter(indent, format, ...)
#   define exit(indent, format, ...)
#endif

#endif

void _debug(const char *type, const char *function, indent_t indent, const char *format, ...);

