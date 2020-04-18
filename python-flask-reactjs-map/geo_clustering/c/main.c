#include <stdlib.h>
#include <stdio.h>
#include <sys/time.h>

#include "haversine.h"

#include "geo_types.h"
#include "geo_algorithm.h"
#include "distances_from_points_grouping.h"

#include "debug.h"

const int NUM_POINTS = 1000;

static void test_haversine();

static float random_0_to_1();

static void gen_points(geo_clustered_point_t *const dst, uint32_t num_points);
static uint32_t sum_points(const geo_clustered_point_t *points, uint32_t num_points);

static void test(indent_t indent, const geo_clustered_point_t *const test_points, uint32_t num_points, float max_diameter_km);

static void test_three_points();
static void test_random_points();

int main(int argc, char **argv){


    test_haversine();

    // if (1) return 0;

    test_random_points();

    return 0;
}

static void test_three_points() {

    geo_input_point_t test_points[3];

    test_points[0].count = 20;
    test_points[0].geo_point.latitude = 4.5;
    test_points[0].geo_point.longitude = 0.5;
    
    test_points[1].count = 15;
    test_points[1].geo_point.latitude = 3.5;
    test_points[1].geo_point.longitude = 1;
 
    test_points[2].count = 30;
    test_points[2].geo_point.latitude = 1.5;
    test_points[2].geo_point.longitude = 4.1;
    
    test(0, test_points, 3, 2000);
}

static void test_random_points() {

    geo_input_point_t test_points[NUM_POINTS];

    gen_points(test_points, NUM_POINTS);

    test(0, test_points, NUM_POINTS, 2000);
}

static void test(indent_t indent, const geo_clustered_point_t *const test_points, uint32_t num_points, float max_diameter_km) {

    geo_clustered_point_t *out_points;

    const size_t size = BYTES(out_points, 10000);

    out_points = malloc(size);

    if (out_points == NULL) {
        fprintf(stderr, "Failed to init out points\n");
    }
    else {
        const int32_t num_merged = merge_aggregations_fast(
                indent + 1,
                test_points,
                num_points,
                max_diameter_km,
                out_points
            );

        if (num_merged < 0) {
            fprintf(stderr, "Error while merging\n");
        }
        else {

            printf("num_merged %d\n", num_merged);

            printf("Got input counts %d\n", sum_points(test_points, num_points));

            printf("Got output counts %d\n", sum_points(
                        out_points,
                        num_merged));
        }

        free(out_points);
    }
}

static void gen_points(geo_clustered_point_t *const dst, uint32_t num_points) {

    struct timeval tv;

    gettimeofday(&tv, NULL);

    srand(tv.tv_sec);

    for (int i = 0; i < num_points; ++ i) {
        
        float latitude = random_0_to_1() * 180 - 90;
        float longitude = random_0_to_1() * 360 - 180;

        geo_input_point_t *point = &dst[i];

        point->geo_point.latitude = latitude;
        point->geo_point.longitude = longitude;
        point->count = 100 * random_0_to_1();

        printf("Generated point at (%f, %f) with count %d\n", latitude, longitude, point->count);
    }
}

static uint32_t sum_points(const geo_clustered_point_t *points, uint32_t num_points) {

    uint32_t count = 0;

    for (int i = 0; i < num_points; ++ i) {
        // printf("value %d\n", points[i].count);
        count += points[i].count;
    }

    return count;
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

