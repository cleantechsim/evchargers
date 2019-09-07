#ifndef BITMAP_H
#define BITMAP_H

#include "types.h"

typedef void *bitmap_t;

bitmap_t *bitmap_allocate(uint32_t nbits);
void bitmap_set(bitmap_t *const bitmap, uint32_t bit);
boolean bitmap_is_set(const bitmap_t *const bitmap, uint32_t bit);
void bitmap_clear(bitmap_t *const bitmap, uint32_t nbits);
void bitmap_free(bitmap_t *const bitmap);

#endif


