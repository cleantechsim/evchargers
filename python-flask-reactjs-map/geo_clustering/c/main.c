#include <stdlib.h>
#include <stdio.h>
#include <sys/time.h>

#include "haversine.h"

#include "scratchbuf.h"
#include "geo_types.h"
#include "distances_from_points_grouping.h"

const int NUM_POINTS = 10000;

static void test_haversine();

static float random_0_to_1();

int main(int argc, char **argv){

    geo_point_t test_points[NUM_POINTS];

    struct timeval tv;

    scratch_buf_t distances_buf;

    test_haversine();

    // if (1) return 0;

    gettimeofday(&tv, NULL);

    srand(tv.tv_sec);

    for (int i = 0; i < NUM_POINTS; ++ i) {
        
        float latitude = random_0_to_1() * 180 - 90;
        float longitude = random_0_to_1() * 360 - 180;

        geo_point_t *point = &test_points[i];

        point->latitude = latitude;
        point->longitude = longitude;

        // printf("Generated point at (%f, %f)\n", latitude, longitude);
    }

    if (!scratch_buf_init(&distances_buf, 100000, sizeof (geo_distance_t))) {
        fprintf(stderr, "Failed to init scratch buf");
    }
    else {

        const int num_distances = make_distances_with_max(
            test_points,
            NUM_POINTS,
            2000,
            &distances_buf
        );

        printf("Got %d distances\n", num_distances);

        scratch_buf_free(&distances_buf);
    }

    return 0;
}

static float random_0_to_1() {
    return rand() / (float)RAND_MAX;
}

static void test_haversine() {
    
    const float height = haversine(
        90, 0,
        -90, 0,
        KILOMETERS);

    printf("## height %f\n", height);

    const float width = haversine(
        0, -90,
        0, 90,
        KILOMETERS);

    printf("## width %f\n", width);

    const float three_degrees_height = haversine(
        0, 0,
        3.5, 0,
        KILOMETERS);

    printf("## 3.5 degrees height %f\n", three_degrees_height);

 
    const float three_degrees_width = haversine(
        0, 0,
        0, 3.5,
        KILOMETERS);

    printf("## 3.5 degrees width %f\n", three_degrees_width);
}

