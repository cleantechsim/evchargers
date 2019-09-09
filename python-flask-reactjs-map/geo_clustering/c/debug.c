#include <stdarg.h>
#include <stdio.h>

#include "debug.h"

static void _print(const char *type, const char *function, indent_t indent, const char *format, va_list ap);

void _debug(const char *type, const char *function, indent_t indent, const char *format, ...) {
    va_list ap;

    va_start(ap, format);

    _print(type, function, indent, format, ap);

    va_end(ap);
}

void _trace(const char *type, const char *function, indent_t indent, const char *format, ...) {
    va_list ap;

    va_start(ap, format);

    _print(type, function, indent, format, ap);

    va_end(ap);
}

static void _print(const char *type, const char *function, indent_t indent, const char *format, va_list ap) {
    for (int i = 0; i < indent; ++ i) {
        printf("   ");
    }

    printf("[%s] %s ", type, function);
    vprintf(format, ap);
    printf("\n");

}

