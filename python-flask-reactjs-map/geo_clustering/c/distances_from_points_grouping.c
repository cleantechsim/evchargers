#include <stddef.h>
#include <stdlib.h>
#include <stdio.h>

#include "haversine.h"
#include "geo_types.h"
#include "scratchbuf.h"
#include "group_points.h"

static int make_distances_from_outer(
    const geo_point_t *const outer,
    const geo_point_t *const points,
    int range_start,
    int range_end,
    float max_distance_to_append,
    scratch_buf_t *dst,
    int num_in_dst
);


int make_distances_with_max(
    const geo_point_t *const points,
    uint32_t num_points,
    const int max_km,
    scratch_buf_t *distances_scratch_buf
) {
    scratch_buf_t scratch_buf;

    boolean ok;

    int num_distances = 0;
    
    if (!scratch_buf_init(&scratch_buf, 10000, BYTES(points, 1))) {
        ok = FALSE;
    }
    else {
        geo_point_array_t *grouped_points = NULL;
        
        const size_t grouped_points_bytes = BYTES(grouped_points, num_points);

        grouped_points = malloc(grouped_points_bytes);

        if (grouped_points == NULL) {
            ok = FALSE;
        }
        else {
            ok = group_points(points, num_points, grouped_points, max_km, &scratch_buf);
   
            for (int i = 0; i < num_points; ++ i) {

                const geo_point_t *outer = &points[i];

                const geo_point_array_t *const close_points = &grouped_points[i];

                if (close_points->count > 0) {
                
                    const int group_distances = make_distances_from_outer(
                                        outer,
                                        close_points->points,
                                        0,
                                        close_points->count,
                                        max_km,
                                        distances_scratch_buf,
                                        num_distances
                    );

                    /*
                    printf("got %d distances from %d points\n",
                        group_distances, close_points->count);
                    */

                    if (group_distances < 0) {
                        ok = FALSE;
                        break;
                    }

                    num_distances += group_distances;
                }
            }

            for (int i = 0; i < num_points; ++ i) {
                geo_point_array_t *array = &grouped_points[i];

                if (array->points != NULL) {
                    free(array->points);
                }
            }

            free(grouped_points);
        } 

        scratch_buf_free(&scratch_buf);
    }

    return ok ? num_distances : -1;
}

static int make_distances_from_outer(
    const geo_point_t *const outer,
    const geo_point_t *const points,
    int range_start,
    int range_end,
    float max_distance_to_append,
    scratch_buf_t *dst,
    int num_in_dst
) {

    // printf("## from %d to %d\n", range_start, range_end);

    int count = 0;

    for (int j = range_start; j < range_end; ++ j) {

        const geo_point_t *const inner = &points[j];

        const float distance_km = haversine(
            outer->latitude,
            outer->longitude,
            inner->latitude,
            inner->longitude,
            KILOMETERS
        );

        // printf("## distance %f\n", distance_km);

        if (distance_km <= max_distance_to_append) {

            // printf("adding point\n");

            if (num_in_dst == dst->nmemb) {
                if (!scratch_buf_realloc(dst)) {
                    count = -1;
                    break;
                }
            }

            geo_distance_t *distance = scratch_buf_at(dst, num_in_dst ++);

            ++ count;

            distance->distance = distance_km;
            distance->from_point = outer;
            distance->to_point = inner;
        }
    }

    return count;
}


