#include <stddef.h>
#include <stdlib.h>
#include <stdio.h>

#include "scratchbuf.h"

boolean scratch_buf_init(scratch_buf_t *scratch_buf, size_t nmemb, size_t memb_size) {

    const size_t alloc_bytes = nmemb * memb_size;

    void *allocated = malloc(alloc_bytes);

    boolean ok;

    if (allocated == NULL) {
        ok = FALSE;
    }
    else {
        scratch_buf->nmemb = nmemb;
        scratch_buf->memb_size = memb_size;
        scratch_buf->buf = allocated;
        ok = TRUE;
    }
    
    return ok;
} 

boolean scratch_buf_realloc(scratch_buf_t *scratch_buf) {

    const size_t realloc_nmemb = scratch_buf->nmemb * 3;
    const size_t realloc_bytes = realloc_nmemb * scratch_buf->memb_size;

    void *reallocated = realloc(scratch_buf, realloc_bytes);

    boolean ok;

    if (reallocated == NULL) {
        ok = FALSE;
    }
    else {
        scratch_buf->buf = reallocated;
        scratch_buf->nmemb = realloc_nmemb;
   
        ok = TRUE; 
    }

    return ok;
}

void scratch_buf_free(scratch_buf_t *scratch_buf) {

    free(scratch_buf->buf);

    scratch_buf->buf = NULL;
    scratch_buf->nmemb = 0;
    scratch_buf->memb_size = 0;
}

size_t scratch_buf_size_bytes(const scratch_buf_t *const scratch_buf, size_t nmemb) {
    return nmemb * scratch_buf->memb_size;
}

void *scratch_buf_at(const scratch_buf_t *const scratch_buf, unsigned int index) {

    if (index >= scratch_buf->nmemb) {
        fprintf(stderr, "Out of range\n");
    }

/*
    printf("access at %d in memb size %ld, nmemb %ld\n",
        index,
        scratch_buf->memb_size,
        scratch_buf->nmemb);
*/

    return &UB(scratch_buf->buf)[index * scratch_buf->memb_size];
}
