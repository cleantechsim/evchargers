#include <stdarg.h>
#include <stdio.h>

#include "debug.h"

void _debug(const char *type, const char *function, indent_t indent, const char *format, ...) {

    va_list ap;

    va_start(ap, format);

    for (int i = 0; i < indent; ++ i) {
        printf("   ");
    }

    printf("[%s] %s ", type, function);
    vprintf(format, ap);
    printf("\n");

    va_end(ap);
}

