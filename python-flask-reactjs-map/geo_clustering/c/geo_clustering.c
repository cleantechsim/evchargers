#include <stdio.h>

#include "geo_clustering.h"
#include "geo_clustering_point_merger.h"

#include "distances_from_points_grouping.h"

#include "bitmap.h"

#include "debug.h"

static int32_t _merge_aggregations(
    indent_t indent,

    const geo_input_point_t *const input_points,
    uint32_t num_input_points,

    float max_diameter_km,
   
    /* Holds at least space for num_input_points */ 
    scratch_buf_t *const out_points,

    bitmap_t *const removed_points_bitmap,

    scratch_buf_t *const distances_scratch_buf,
    
    /* Holds at least space for num_input_points */ 
    scratch_buf_t *const merge_points_scratch_buf);

int32_t merge_aggregations(
    indent_t indent,
    const geo_input_point_t *const input_points,
    uint32_t num_input_points,

    float max_diameter_km,
   
    /* Holds at least space for num_input_points */ 
    scratch_buf_t *const out_points

) {

    enter(indent, "num_input_points=%d, max_diameter_km=%f", num_input_points, max_diameter_km);

    /* Allocate bitmap of points that are removed for each iteration */
    bitmap_t *removed_points_bitmap = bitmap_allocate(num_input_points);

    uint32_t num_points = num_input_points;

    boolean ok = TRUE;

    if (removed_points_bitmap == NULL) {
        ok = FALSE;
    }
    else {
        scratch_buf_t distances_scratch_buf;

        if (!scratch_buf_init(&distances_scratch_buf, num_input_points, sizeof (geo_scratch_distance_t))) {
            ok = FALSE;
        }
        else {
            scratch_buf_t merged_points_scratch_buf;

            if (!scratch_buf_init(&merged_points_scratch_buf, num_input_points, sizeof (geo_merged_point_t))) {
                ok = FALSE;
            }
            else {

                const int32_t merged = _merge_aggregations(
                    indent + 1,
                    input_points,
                    num_input_points,
                    max_diameter_km,
                    out_points,
                    removed_points_bitmap,
                    &distances_scratch_buf,
                    &merged_points_scratch_buf
                );

                if (merged < 0) {
                    ok = FALSE;
                }
                else {
                    num_points = merged;
                }

                scratch_buf_free(&merged_points_scratch_buf);
            }

            scratch_buf_free(&distances_scratch_buf);
        }

        bitmap_free(removed_points_bitmap);
    }

    const int32_t result = ok ? num_points : -1;

    exit(indent, "result=%d", result);

    return result;
}

static int32_t _merge_aggregations(
    indent_t indent,

    const geo_input_point_t *const input_points,
    uint32_t num_input_points,

    float max_diameter_km,
   
    /* Holds at least space for num_input_points */ 
    scratch_buf_t *const out_points,

    bitmap_t *const removed_points_bitmap,

    scratch_buf_t *const distances_scratch_buf,
    
    /* Holds at least space for num_input_points */ 
    scratch_buf_t *const merged_points_scratch_buf) {

    boolean done = FALSE;

    const geo_clustered_point_t *cur_points = input_points;
    uint32_t cur_num_points = num_input_points;

    boolean ok = TRUE;

    enter(indent, "num_input_points=%d, max_diameter_km=%f", num_input_points, max_diameter_km);

    while (ok && !done) {
        /* Find all distances that are below max */
        const int32_t num_distances = make_distances_with_max(
                    indent + 1,
                    cur_points,
                    cur_num_points,
                    max_diameter_km,
                    distances_scratch_buf);

        if (num_distances < 0) {
             /* mem allocation failure */
             ok = FALSE;
        }
        else {
            const int32_t merged_distances = merge_distances_below_max(
                        indent + 1,
                        distances_scratch_buf->buf,
                        num_distances,
                        max_diameter_km,
                        merged_points_scratch_buf,
                        removed_points_bitmap            
                    );

            if (merged_distances < 0) {
                ok = FALSE;
            }
            else if (merged_distances == 0) {
                break;
            }
            else {

                fprintf(stderr, "Add sorting of distances\n");

                uint32_t num_points_in_scratch_buf = merged_distances;

                 /* out_points contains merged points.
                    add points from input of last iteration that were not removed
                  */
                for (int i = 0; i < cur_num_points; ++ i) {
                    if (!bitmap_is_set(removed_points_bitmap, i)) {

                        if (num_points_in_scratch_buf == merged_points_scratch_buf->nmemb) {
                            if (!scratch_buf_realloc(merged_points_scratch_buf)) {
                                ok = FALSE;
                                break;
                            }
                        }

                        geo_clustered_point_t *dst = scratch_buf_at(merged_points_scratch_buf, num_points_in_scratch_buf ++);
                        *dst = cur_points[i];
                     }
                }

                /* input from out_points */

                for (int i = 0; i < num_points_in_scratch_buf; ++ i) {
                    if (i == out_points->nmemb) {
                        if (!scratch_buf_realloc(out_points)) {
                            ok = FALSE;
                            break;
                        }
                    }

                    const geo_clustered_point_t *const src = scratch_buf_at(merged_points_scratch_buf, i);
                    geo_clustered_point_t *const dst = scratch_buf_at(out_points, i);
               
                    *dst = *src; 
                }

                debug(indent, "Got new cur_num_points %d", num_points_in_scratch_buf);

                cur_points = out_points->buf;
                cur_num_points = num_points_in_scratch_buf;

                bitmap_clear(removed_points_bitmap, num_input_points);
            }
        }
    }

    const int32_t result = ok ? cur_num_points : -1;

    exit(indent, "result=%d", result);

    return result;
}
