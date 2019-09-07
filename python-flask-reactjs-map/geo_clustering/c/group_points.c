#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#include "haversine.h"
#include "types.h"
#include "geo_types.h"
#include "scratchbuf.h"
#include "group_points.h"

static int compare_points(geo_point_t *point, geo_point_t *other);

static float diff(float val, float other);

static boolean add_if_close(
    const geo_point_t *const sorted_by_latitude,
    const float max_degrees_latitude,
    const float max_km,
    const int range_start,
    const int range_end,
    const geo_point_t *const geo_point,
    geo_point_array_t *const dst,
    const float one_longitude_degree_km,
    scratch_buf_t *scratch_buf);

boolean group_points(
    const geo_point_t *const points, 
    const size_t num_points,
    geo_point_array_t *const dst,
    const float max_km,
    scratch_buf_t *scratch_buf) {

    size_t one_point_bytes = BYTES(points, 1);
    size_t all_point_bytes = BYTES(points, num_points);

    geo_point_t *sorted_by_latitude = malloc(all_point_bytes);

    boolean ok = TRUE;

    if (sorted_by_latitude == NULL) {
        ok = FALSE;
    }
    else {

        memcpy(sorted_by_latitude, points, all_point_bytes);
   
        qsort(sorted_by_latitude, num_points, one_point_bytes, (void*)&compare_points);

        const float max_degrees = max_km / 100.0;


        for (int i = 0; i < num_points; ++ i) {
            const geo_point_t *point = &sorted_by_latitude[i];

            const float one_longitude_degree_km = haversine(
                point->latitude, 0,
                point->latitude, 1,
                KILOMETERS);

            ok = add_if_close(
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

    return ok;
}

static boolean add_if_close(
    const geo_point_t *const sorted_by_latitude,
    const float max_degrees_latitude,
    const float max_km,
    const int range_start,
    const int range_end,
    const geo_point_t *const geo_point,
    geo_point_array_t *const dst,
    const float one_longitude_degree_km,
    scratch_buf_t *scratch_buf) {

    const float latitude = geo_point->latitude;
    const float latitude_plus_90 = latitude + 90.0;

    const float longitude = geo_point->longitude;
    const float longitude_plus_180 = longitude + 180;

    int added = 0;

    boolean ok = TRUE;

    for (int j = range_start; j < range_end; ++ j) {
       
        const geo_point_t *const other = &sorted_by_latitude[j];
        
        if (other->latitude > geo_point->latitude) {    
            fprintf(stderr, "Expected sorted\n");
        }

        // printf("max degrees %f\n", max_degrees_latitude);
  
        const float other_latitude_plus_90 = other->latitude + 90.0;

        const float latitude_diff = diff(latitude_plus_90, other_latitude_plus_90);

        if (latitude_diff < max_degrees_latitude) {


            const float other_longitude = other->longitude;
            const float other_longitude_plus_180 = other_longitude + 180.0;

            const float longitude_diff = diff(longitude_plus_180, other_longitude_plus_180);

            const float longitude_diff_km = longitude_diff * one_longitude_degree_km;

            // printf("longitude diff %f\n", one_longitude_degree_km);

            if (longitude_diff_km < max_km) {

                /*
                const float distance = haversine(
                    geo_point->latitude,
                    geo_point->longitude,
                    other->latitude,
                    other->longitude,
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

                geo_point_t *dst = scratch_buf_at(scratch_buf, added ++);

                *dst = *other;
            }
            else {
                break;
            }
        }
 
    }

    if (ok) {
        geo_point_t *close_points_buf;
        
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
            dst->points = close_points_buf;
            dst->count = added;
        }
    }

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
