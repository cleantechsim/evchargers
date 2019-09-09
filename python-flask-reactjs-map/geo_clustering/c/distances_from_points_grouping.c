#include <stddef.h>
#include <stdlib.h>
#include <stdio.h>

#include "debug.h"
#include "distances_from_points_grouping.h"
#include "haversine.h"
#include "geo_types.h"
#include "scratchbuf.h"
#include "group_points.h"
#include "geo_scratch_types.h"

static int make_distances_from_outer(
    const geo_scratch_clustered_point_t *const outer,
    const geo_scratch_clustered_point_t *const points,
    int range_start,
    int range_end,
    float max_distance_to_append,
    scratch_buf_t *dst,
    int num_in_dst
);

static void print_grouped_points(indent_t indent, const geo_scratch_point_array_t *const groups, uint32_t num_groups);
static void print_distances(indent_t indent, const geo_scratch_distance_t *const distances, uint32_t count);

int make_distances_with_max(
    indent_t indent,
    const geo_scratch_clustered_point_t *const points,
    uint32_t num_points,
    const float max_km,
    scratch_buf_t *distances_scratch_buf
) {
    scratch_buf_t scratch_buf;

    boolean ok = TRUE;

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
            const int32_t num_groups = group_points(indent + 1, points, num_points, grouped_points, max_km, &scratch_buf);
            
            if (num_groups < 0) {
                ok = FALSE;
            }
            else {

                print_grouped_points(indent + 1, grouped_points, num_groups);
   
                for (int i = 0; i < num_groups; ++ i) {


                    const geo_scratch_point_array_t *const close_points = &grouped_points[i];
                    if (close_points->count > 0) {
                
                        const geo_scratch_clustered_point_t *outer = &close_points->outer;
                        const int32_t group_distances = make_distances_from_outer(
                                        outer,
                                        close_points->points,
                                        0,
                                        close_points->count,
                                        max_km,
                                        distances_scratch_buf,
                                        num_distances
                        );

                        trace(indent, "at group %d (%f, %f) got %d distances from %d points",
                            i, outer->base.geo_point.latitude, outer->base.geo_point.longitude, group_distances, close_points->count);

                        if (group_distances < 0) {
                            ok = FALSE;
                            break;
                        }

                        if (TRACE) {
                            print_distances(indent + 1, distances_scratch_buf->buf, group_distances);
                        }

                        num_distances += group_distances;
                    }
                }
            }

            free_grouped_points(grouped_points, num_points);
            free(grouped_points);
        } 

        scratch_buf_free(&scratch_buf);
    }

    const int32_t result = ok ? num_distances : -1;

    exit(indent, "result=%d", result);

    return result;
}

static void print_grouped_points(indent_t indent, const geo_scratch_point_array_t *const groups, uint32_t num_groups) {
#if TRACE
    for (uint32_t i = 0; i < num_groups; ++ i) {
        const geo_scratch_point_array_t *const group = &groups[i];

        debug(indent, "group %d (%f, %f)", i, group->outer.base.geo_point.latitude, group->outer.base.geo_point.longitude);

        for (uint32_t j = 0; j < group->count; ++ j) {

            const geo_scratch_clustered_point_t *const point = &group->points[j];

            debug(indent +  1, "point %d (%f, %f) original index %d",
                    j,
                    point->base.geo_point.latitude,
                    point->base.geo_point.longitude,
                    point->original_index);
        }
    }
#endif
}


static void print_distances(indent_t indent, const geo_scratch_distance_t *const distances, uint32_t count) {
#if TRACE
    for (uint32_t i = 0; i < count; ++ i) {
        const geo_scratch_distance_t *const distance = &distances[i];

        debug(indent, "computed distance at index %d from (%f, %f) index %d to (%f, %f) index %d",
                    i,
                    distance->from_point.geo_point.latitude,
                    distance->from_point.geo_point.longitude,
                    distance->from_point_index,
                    distance->to_point.geo_point.latitude,
                    distance->to_point.geo_point.longitude,
                    distance->to_point_index);

    }
#endif
}



static int make_distances_from_outer(
    const geo_scratch_clustered_point_t *const outer,
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
            outer->base.geo_point.latitude,
            outer->base.geo_point.longitude,
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

            if (outer->original_index == inner->original_index) {
                fprintf(stderr, "from_index == original_index\n");
            }

            distance->distance = distance_km;
            distance->from_point = outer->base;
            distance->to_point = inner->base;
            distance->from_point_index = outer->original_index;
            distance->to_point_index = inner->original_index;
        }
    }

    return count;
}


