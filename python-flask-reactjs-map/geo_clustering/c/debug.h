#ifndef DEBUG_H
#define DEBUG_H

#define DEBUG 0
#define TRACE 0

typedef char indent_t;

#if (DEBUG == 1)

#   define debug_(indent, format) _debug("DEBUG", __FUNCTION__, indent, format)
#   define debug(indent, format, ...) _debug("DEBUG", __FUNCTION__, indent, format, __VA_ARGS__)
#   define enter(indent, format, ...) _debug("ENTER", __FUNCTION__, indent, format, __VA_ARGS__)
#   define exit(indent, format, ...)  _debug("EXIT",  __FUNCTION__, indent, format, __VA_ARGS__)

#else

#   define debug_(indent, format)
#   define debug(indent, format, ...)
#   define enter(indent, format, ...)
#   define exit(indent, format, ...)

#endif

#if (TRACE == 1)

#   define trace_(indent, format) _trace("TRACE", __FUNCTION__, indent, format)
#   define trace(indent, format, ...) _trace("TRACE", __FUNCTION__, indent, format, __VA_ARGS__)
#   define trace_enter(indent, format, ...) _trace("ENTER", __FUNCTION__, indent, format, __VA_ARGS__)
#   define trace_exit(indent, format, ...)  _trace("EXIT",  __FUNCTION__, indent, format, __VA_ARGS__)

#else

#   define trace_(indent, format)
#   define trace(indent, format, ...)
#   define trace_enter(indent, format, ...)
#   define trace_exit(indent, format, ...)

#endif

#endif

void _debug(const char *type, const char *function, indent_t indent, const char *format, ...);
void _trace(const char *type, const char *function, indent_t indent, const char *format, ...);
