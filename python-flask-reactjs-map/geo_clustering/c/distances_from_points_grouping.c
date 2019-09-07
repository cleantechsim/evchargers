#include <stddef.h>
#include <stdlib.h>
#include <stdio.h>

#include "distances_from_points_grouping.h"
#include "haversine.h"
#include "geo_types.h"
#include "scratchbuf.h"
#include "group_points.h"
#include "geo_scratch_types.h"

static int make_distances_from_outer(
    int from_index,
    const geo_clustered_point_t *const outer,
    const geo_scratch_clustered_point_t *const points,
    int range_start,
    int range_end,
    float max_distance_to_append,
    scratch_buf_t *dst,
    int num_in_dst
);

int make_distances_with_max(
    indent_t indent,
    const geo_clustered_point_t *const points,
    uint32_t num_points,
    const int max_km,
    scratch_buf_t *distances_scratch_buf
) {
    scratch_buf_t scratch_buf;

    boolean ok;

    int num_distances = 0;

    const geo_scratch_clustered_point_t *scratch_point = NULL;

    enter(indent, "num_points=%d, max_km=%f", num_points, max_km);
    
    if (!scratch_buf_init(&scratch_buf, 10000, BYTES(scratch_point, 1))) {
        ok = FALSE;
    }
    else {
        geo_scratch_point_array_t *grouped_points = NULL;
        
        const size_t grouped_points_bytes = BYTES(grouped_points, num_points);

        grouped_points = malloc(grouped_points_bytes);

        if (grouped_points == NULL) {
            ok = FALSE;
        }
        else {
            ok = group_points(indent + 1, points, num_points, grouped_points, max_km, &scratch_buf);
   
            for (int i = 0; i < num_points; ++ i) {

                const geo_clustered_point_t *outer = &points[i];

                const geo_scratch_point_array_t *const close_points = &grouped_points[i];
                if (close_points->count > 0) {
                
                    const int group_distances = make_distances_from_outer(
                                        i,
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
                geo_scratch_point_array_t *array = &grouped_points[i];

                if (array->points != NULL) {
                    free(array->points);
                }
            }

            free(grouped_points);
        } 

        scratch_buf_free(&scratch_buf);
    }

    const int32_t result = ok ? num_distances : -1;

    exit(indent, "result=%d", result);

    return result;
}

static int make_distances_from_outer(
    int from_index,
    const geo_clustered_point_t *const outer,
    const geo_scratch_clustered_point_t *const points,
    int range_start,
    int range_end,
    float max_distance_to_append,
    scratch_buf_t *dst,
    int num_in_dst
) {

    // printf("## from %d to %d\n", range_start, range_end);

    int count = 0;

    for (int j = range_start; j < range_end; ++ j) {

        const geo_scratch_clustered_point_t *const inner = &points[j];

        const float distance_km = haversine(
            outer->geo_point.latitude,
            outer->geo_point.longitude,
            inner->base.geo_point.latitude,
            inner->base.geo_point.longitude,
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

            geo_scratch_distance_t *distance = scratch_buf_at(dst, num_in_dst ++);

            ++ count;

            if (from_index == inner->original_index) {
                fprintf(stderr, "from_index == original_index\n");
            }

            distance->distance = distance_km;
            distance->from_point = *outer;
            distance->to_point = inner->base;
            distance->from_point_index = from_index;
            distance->to_point_index = inner->original_index;
        }
    }

    return count;
}


