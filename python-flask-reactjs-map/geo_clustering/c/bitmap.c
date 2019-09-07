#include <stddef.h>
#include <stdlib.h>
#include <string.h>

#include "bitmap.h"

static uint32_t bitmap_size_bytes(uint32_t nbits);
static void bitmap_set_value(bitmap_t *bitmap, uint32_t bit, boolean value);
static boolean bitmap_get_value(const bitmap_t *const bitmap, uint32_t bit);


bitmap_t *bitmap_allocate(uint32_t nbits) {
    
    const size_t size = bitmap_size_bytes(nbits);

    void *mem = malloc(size);


    if (mem != NULL) {
        memset(mem, 0, size);
    }

    return mem;
}

void bitmap_clear(bitmap_t *const bitmap, uint32_t nbits) {
    
    const size_t size = bitmap_size_bytes(nbits);

    memset(bitmap, 0, size);
}

void bitmap_set(bitmap_t *const bitmap, uint32_t bit) {
    bitmap_set_value(bitmap, bit, TRUE);
}

boolean bitmap_is_set(const bitmap_t *const bitmap, uint32_t bit) {
    return bitmap_get_value(bitmap, bit);
}

static uint32_t bitmap_size_bytes(uint32_t nbits) {
    return ((nbits - 1) / 8) + 1;
}


static void bitmap_set_value(bitmap_t *const bitmap, uint32_t bit, boolean value) {

    const uint32_t idx = bit / 8;


    UB(bitmap)[idx] |= bit % 8;
}

static boolean bitmap_get_value(const bitmap_t *const bitmap, uint32_t bit) {

    const uint32_t idx = bit / 8;

    return (UB(bitmap)[idx] & (bit % 8)) != 0;
}

void bitmap_free(bitmap_t *bitmap) {
    free(bitmap);
}

