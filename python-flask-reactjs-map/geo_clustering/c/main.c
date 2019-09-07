#include <stdlib.h>
#include <stdio.h>
#include <sys/time.h>

#include "haversine.h"

#include "scratchbuf.h"
#include "geo_types.h"
#include "geo_clustering.h"
#include "distances_from_points_grouping.h"

#include "debug.h"

const int NUM_POINTS = 100;

static void test_haversine();

static float random_0_to_1();

static void gen_points(geo_clustered_point_t *const dst, uint32_t num_points);
static uint32_t sum_points(const geo_clustered_point_t *points, uint32_t num_points);

static void test(indent_t indent, const geo_clustered_point_t *const test_points, uint32_t num_points, float max_diameter_km);

int main(int argc, char **argv){

    geo_input_point_t test_points[NUM_POINTS];

    test_haversine();

    // if (1) return 0;

    test_points[0].count = 20;
    test_points[0].geo_point.latitude = 0;
    test_points[0].geo_point.longitude = 0;
    
    test_points[1].count = 15;
    test_points[1].geo_point.latitude = 3;
    test_points[1].geo_point.longitude = 1;
 
    test_points[2].count = 30;
    test_points[2].geo_point.latitude = 1;
    test_points[2].geo_point.longitude = 3;

    test(0, test_points, 3, 2000);

    return 0;
}

static void test(indent_t indent, const geo_clustered_point_t *const test_points, uint32_t num_points, float max_diameter_km) {

    scratch_buf_t distances_buf;

    if (!scratch_buf_init(&distances_buf, 100000, sizeof (geo_distance_t))) {
        fprintf(stderr, "Failed to init scratch buf\n");
    }
    else {
        scratch_buf_t out_points_scratch_buf;

        const int num_distances = make_distances_with_max(
            indent + 1,
            test_points,
            num_points,
            max_diameter_km,
            &distances_buf
        );

        debug(indent, "Got %d distances\n", num_distances);

        scratch_buf_free(&distances_buf);

        /* cluster points */

        if (!scratch_buf_init(&out_points_scratch_buf, 10000, sizeof (geo_input_point_t))) {
            fprintf(stderr, "Failed to init out points\n");
        }
        else {
    
            const int32_t num_merged = merge_aggregations(
                indent + 1,
                test_points,
                num_points,
                max_diameter_km,
                &out_points_scratch_buf
            );

            printf("Got input counts %d\n", sum_points(test_points, num_points));

            printf("Got output counts %d\n", sum_points(
                        out_points_scratch_buf.buf,
                        num_merged));

            scratch_buf_free(&out_points_scratch_buf);
        }
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

        // printf("Generated point at (%f, %f)\n", latitude, longitude);
    }
}

static uint32_t sum_points(const geo_clustered_point_t *points, uint32_t num_points) {

    uint32_t count = 0;

    for (int i = 0; i < num_points; ++ i) {
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

