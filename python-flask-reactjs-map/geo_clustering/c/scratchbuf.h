#ifndef SCRATCHBUF_H
#define SCRATCHBUF_H

#include "types.h"

typedef struct {

    void *buf;
    size_t nmemb;
    size_t memb_size;
} scratch_buf_t;

boolean scratch_buf_init(scratch_buf_t *scratch_buf, size_t nmemb, size_t size);
boolean scratch_buf_realloc(scratch_buf_t *scratch_buf);
void scratch_buf_free(scratch_buf_t *scratch_buf);

size_t scratch_buf_size_bytes(const scratch_buf_t *const scratch_buf, size_t nmemb);

void *scratch_buf_at(const scratch_buf_t *const scratch_buf, unsigned int index);

#endif

