#include <stdio.h>

#include "scratchbuf.h"
#include "bitmap.h"

#include "geo_clustering_point_merger.h"
#include "geo_clustering_types.h"

static void merged_clustering_point_init(
        geo_merged_point_t *const point,
        const geo_scratch_distance_t *const to_merge);

static void compute_mid_point(
        geo_merged_point_t *const dst,
        const geo_clustered_point_t *const from,
        const geo_clustered_point_t *const to);


int32_t merge_distances_below_max(
    const geo_scratch_distance_t *const distances,
    uint32_t num_distances,
    float max_diameter_km,
    scratch_buf_t *out_merged_points,
    bitmap_t out_removed_points
) {

    boolean ok = TRUE;

    uint32_t merged_points_added = 0;

    for (int i = 0; i < num_distances; ++ i) {

        const geo_scratch_distance_t *const distance = &distances[i];
    
        if (    bitmap_is_set(out_removed_points, distance->from_point_index)
             || bitmap_is_set(out_removed_points, distance->to_point_index)) {

            /* Already merged one or both points, so distance no longer usable */
        }
        else {

            /* Check that distance within max diameter, if so ignore */
            if (distance->distance > max_diameter_km) {
                continue;
            }

            /* Can merge the distance since none of points already merged */
            bitmap_set(out_removed_points, distance->from_point_index);
            bitmap_set(out_removed_points, distance->to_point_index);

            /* Add merged point */
            if (merged_points_added == out_merged_points->nmemb) {
                /* Must allocate more space in buffer */
                if (!scratch_buf_realloc(out_merged_points)) {
                    ok = FALSE;
                    break;
                }
            }

            geo_merged_point_t *dst = scratch_buf_at(out_merged_points, merged_points_added ++);

            merged_clustering_point_init(dst, distance);
        }
    } 

    return ok ? merged_points_added : -1;
}


static void merged_clustering_point_init(
        geo_merged_point_t *const point,
        const geo_scratch_distance_t *const to_merge) {


   compute_mid_point(
        point,
        (const geo_clustered_point_t *)&to_merge->from_point,
        (const geo_clustered_point_t *)&to_merge->to_point); 

}

static void compute_mid_point(
        geo_merged_point_t *const dst,
        const geo_clustered_point_t *const from,
        const geo_clustered_point_t *const to) {

    const float from_latitude = from->geo_point.latitude * from->count;
    const float from_longitude = from->geo_point.longitude * from->count; 

    const float to_latitude = to->geo_point.latitude * to->count;
    const float to_longitude = to->geo_point.longitude * to->count;

    const uint32_t sum_count = from->count + to->count;

    const float computed_latitude = (from_latitude + to_latitude) / sum_count;
    const float computed_longitude = (from_longitude + to_longitude) / sum_count;

    printf("set sum count %d from %d and %d\n",
                sum_count,
                from->count,
                to->count);

    dst->count = sum_count;
    dst->geo_point.latitude = computed_latitude;
    dst->geo_point.longitude = computed_longitude;
}




