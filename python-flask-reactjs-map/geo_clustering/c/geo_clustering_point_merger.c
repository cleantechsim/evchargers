#include "debug.h"

#include "geo_clustering_point_merger.h"
#include "geo_clustering_types.h"

static void merged_clustering_point_init(
        indent_t indent,
        geo_merged_point_t *const point,
        const geo_scratch_distance_t *const to_merge);

static void compute_mid_point(
        indent_t indent,
        geo_merged_point_t *const dst,
        const geo_clustered_point_t *const from,
        const geo_clustered_point_t *const to);


int32_t merge_distances_below_max(
    indent_t indent,
    const geo_scratch_distance_t *const distances,
    uint32_t num_distances,
    float max_diameter_km,
    scratch_buf_t *out_merged_points,
    bitmap_t *out_removed_points
) {

    boolean ok = TRUE;

    uint32_t merged_points_added = 0;

    enter(indent, "num_distances=%d, max_diameter_km=%f", num_distances, max_diameter_km);

    for (int i = 0; i < num_distances; ++ i) {

        const geo_scratch_distance_t *const distance = &distances[i];

        debug(indent, "considering point at index %d from (%f, %f) index %d to (%f, %f) index %d",
                    i,
                    distance->from_point.geo_point.latitude,
                    distance->from_point.geo_point.longitude,
                    distance->from_point_index,
                    distance->to_point.geo_point.latitude,
                    distance->to_point.geo_point.longitude,
                    distance->to_point_index);

        debug(indent, "bitmap initial byte is 0x%01x", UB(out_removed_points)[0]);
   
        debug(indent, "is_set %d %d",
                bitmap_is_set(out_removed_points, distance->from_point_index),
                bitmap_is_set(out_removed_points, distance->to_point_index));


     
        if (    bitmap_is_set(out_removed_points, distance->from_point_index)
             || bitmap_is_set(out_removed_points, distance->to_point_index)) {

            /* Already merged one or both points, so distance no longer usable */
            debug_(indent, "skipping distance already set");
        }
        else {

            /* Check that distance within max diameter, if so ignore */
            if (distance->distance > max_diameter_km) {
                debug_(indent, "skipping distance due to outside of range");
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

            merged_clustering_point_init(indent + 1, dst, distance);
        }
    } 

    const int32_t result = ok ? merged_points_added : -1;

    exit(indent, "result=%d", result);

    return result;
}


static void merged_clustering_point_init(
        indent_t indent,
        geo_merged_point_t *const point,
        const geo_scratch_distance_t *const to_merge) {


   compute_mid_point(
        indent,
        point,
        (const geo_clustered_point_t *)&to_merge->from_point,
        (const geo_clustered_point_t *)&to_merge->to_point); 

}

static void compute_mid_point(
        indent_t indent,
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

    enter(indent, "from=(%f, %f) count %d, to=(%f, %f) count %d",
            from->geo_point.latitude,
            from->geo_point.longitude,
            from->count,
            to->geo_point.latitude,
            to->geo_point.longitude,
            to->count);

    debug(indent, "set sum count %d from %d and %d",
                sum_count,
                from->count,
                to->count);

    dst->count = sum_count;
    dst->geo_point.latitude = computed_latitude;
    dst->geo_point.longitude = computed_longitude;

    exit(indent, "dst=(%f, %f) count=%d",
        dst->geo_point.latitude,
        dst->geo_point.longitude,
        dst->count);

}




