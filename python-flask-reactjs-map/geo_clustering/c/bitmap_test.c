#include <stddef.h>
#include <assert.h>

#include "bitmap.h"

static void test_cleared();
static void test_set();

int main(int argc, char **argv) {

    test_cleared();
    test_set();
}

static void test_cleared() {

    const uint32_t nbits = 32;

    bitmap_t *bitmap = bitmap_allocate(nbits);

    assert(bitmap != NULL);

    for (uint32_t i = 0; i < nbits; ++ i) {
        assert(!bitmap_is_set(bitmap, i));
    }

    bitmap_free(bitmap);
}

static void test_set() {

    const uint32_t nbits = 32;

    for (uint32_t bit_to_test = 0; bit_to_test < nbits; ++ bit_to_test) {
        bitmap_t *bitmap = bitmap_allocate(nbits);

        assert(bitmap != NULL);

        bitmap_set(bitmap, bit_to_test);

        assert(bitmap_is_set(bitmap, bit_to_test));

        for (uint32_t i = 0; i < nbits; ++ i) {
            if (i != bit_to_test) {
                assert(!bitmap_is_set(bitmap, i));
            }
        }

        bitmap_free(bitmap);
    }
}


