#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#include "haversine.h"
#include "types.h"
#include "geo_types.h"
#include "scratchbuf.h"
#include "group_points.h"
#include "print.h"

static int compare_points(geo_point_t *point, geo_point_t *other);

static float diff(float val, float other);

static boolean add_if_close(
    indent_t indent,
    const geo_scratch_clustered_point_t *const sorted_by_latitude,
    const float max_degrees_latitude,
    const float max_km,
    const int range_start,
    const int range_end,
    const geo_scratch_clustered_point_t *const clustered_point,
    geo_scratch_point_array_t *const dst,
    const float one_longitude_degree_km,
    scratch_buf_t *scratch_buf);

boolean group_points(
    indent_t indent,
    const geo_scratch_clustered_point_t *const points, 
    const size_t num_points,
    geo_scratch_point_array_t *const dst,
    const float max_km,
    scratch_buf_t *scratch_buf) {

    enter(indent, "num_points=%d, max_km=%f", num_points, max_km);

    size_t one_point_bytes = BYTES(points, 1);
    size_t all_point_bytes = BYTES(points, num_points);

    geo_scratch_clustered_point_t *sorted_by_latitude = malloc(all_point_bytes);

    boolean ok = TRUE;

    /* we are not comparing last point to another since there are no more points in the array */
    uint32_t to_process = num_points > 0 ? num_points - 1 : 0;

    /* clear for check on whether to free memory */
    for (uint32_t i = 0; i < num_points; ++ i) {
        dst[i].points = NULL;
    }

    if (sorted_by_latitude == NULL) {
        ok = FALSE;
    }
    else {

        debug(indent, "%d points before sorting", num_points);
        print_scratch_clustered_points(indent + 1, points, num_points);

        memcpy(sorted_by_latitude, points, all_point_bytes);
   
        qsort(sorted_by_latitude, num_points, one_point_bytes, (void*)&compare_points);

        debug(indent, "%d points after sorting", num_points);
        print_scratch_clustered_points(indent + 1, sorted_by_latitude, num_points);

        const float max_degrees = max_km / 100.0;

        for (int i = 0; i < to_process; ++ i) {
            const geo_scratch_clustered_point_t *point = &sorted_by_latitude[i];

            const float one_longitude_degree_km = haversine(
                point->base.geo_point.latitude, 0,
                point->base.geo_point.latitude, 1,
                KILOMETERS);

            trace(indent, "computing one longitude degree km from latitude %f: %f",
                point->base.geo_point.latitude,
                one_longitude_degree_km);
 
            ok = add_if_close(
                indent + 1,
                sorted_by_latitude,
                max_degrees,
                max_km,
                i + 1,
                num_points,
                point,
                &dst[i],
                one_longitude_degree_km,
                scratch_buf);

            if (!ok) {
                break;
            }
        }

        free(sorted_by_latitude);
    }

    int32_t result;

    if (ok) {
        result = to_process;
    }
    else {
        result = -1;

        free_grouped_points(dst, num_points);
    }

    exit(indent, "result=%d", result);

    return result;
}

void free_grouped_points(geo_scratch_point_array_t *const array, uint32_t num_points) {

    for (int i = 0; i < num_points; ++ i) {
        geo_scratch_point_array_t *element = &array[i];

        if (element != NULL) {
            free(element->points);
            element->points = NULL;
        }
    }
}

static boolean add_if_close(
    indent_t indent,
    const geo_scratch_clustered_point_t *const sorted_by_latitude,
    const float max_degrees_latitude,
    const float max_km,
    const int range_start,
    const int range_end,
    const geo_scratch_clustered_point_t *const clustered_point,
    geo_scratch_point_array_t *const dst,
    const float one_longitude_degree_km,
    scratch_buf_t *scratch_buf) {

    const float latitude = clustered_point->base.geo_point.latitude;
    const float latitude_plus_90 = latitude + 90.0;

    const float longitude = clustered_point->base.geo_point.longitude;
    const float longitude_plus_180 = longitude + 180;

    int added = 0;

    boolean ok = TRUE;

    trace_enter(indent, "max_degrees_latitude=%f, max_km=%f, range_start=%d, range_end=%d, one_longitude_degree_km=%f",
            max_degrees_latitude, max_km, range_start, range_end, one_longitude_degree_km);

    for (int j = range_start; j < range_end; ++ j) {
       
        const geo_scratch_clustered_point_t *const other = &sorted_by_latitude[j];
        
        if (other->base.geo_point.latitude > clustered_point->base.geo_point.latitude) {    
            fprintf(stderr, "Expected sorted\n");
        }

        // printf("max degrees %f\n", max_degrees_latitude);
  
        const float other_latitude_plus_90 = other->base.geo_point.latitude + 90.0;

        const float latitude_diff = diff(latitude_plus_90, other_latitude_plus_90);

        if (latitude_diff < max_degrees_latitude) {


            const float other_longitude = other->base.geo_point.longitude;
            const float other_longitude_plus_180 = other_longitude + 180.0;

            const float longitude_diff = diff(longitude_plus_180, other_longitude_plus_180);

            const float longitude_diff_km = longitude_diff * one_longitude_degree_km;

            // printf("longitude diff %f\n", one_longitude_degree_km);

            if (longitude_diff_km < max_km) {

                /*
                const float distance = haversine(
                    clustered_point->geo_point.latitude,
                    clustered_point->geo_point.longitude,
                    other->geo_point.latitude,
                    other->geo_point.longitude,
                    KILOMETERS
                );

                printf("adding with distance %f\n", distance);
                */

                if (added == scratch_buf->nmemb) {

                    if (!scratch_buf_realloc(scratch_buf)) {
                        ok = FALSE;
                        break;
                    }
                }

                geo_scratch_clustered_point_t *dst = scratch_buf_at(scratch_buf, added ++);

                *dst= *other;
            }
            else {
                break;
            }
        }
 
    }

    if (ok) {
        geo_scratch_clustered_point_t *close_points_buf;
        
        if (added > 0) {
            const size_t close_points_bytes = scratch_buf_size_bytes(scratch_buf, added);

            // printf("## allocating %ld from %ld\n", close_points_bytes, added);
            close_points_buf = malloc(close_points_bytes);

            if (close_points_buf == NULL) {
                ok = FALSE; 
            }
            else {
                memcpy(close_points_buf, scratch_buf->buf, close_points_bytes);
                ok = TRUE;
            }
        }
        else {
            close_points_buf = NULL;
            ok = TRUE;
        }

        if (ok) {
            dst->outer = *clustered_point;
            dst->points = close_points_buf;
            dst->count = added;
        }
    }

    trace_exit(indent, "ok=%d", ok);

    return ok;
}

static float diff(float val, float other) {

    return other < val ? val - other : other - val;
}

static int compare_points(geo_point_t *point, geo_point_t *other) {

    int result;

    // Latitude descending
    if (point->latitude < other->latitude) {
        result = 1;
    }
    else if (point->latitude > other->latitude) {
        result = -1;
    }
    else {
        // Longitude ascending
        result = point->longitude < other->longitude
                ? -1
                : (point->longitude > other->longitude ? 1 : 0);
    }

    return result;
}
