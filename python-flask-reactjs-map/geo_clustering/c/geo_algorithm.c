#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <assert.h>

#include "types.h"
#include "debug.h"
#include "geo_clustering_types.h"
#include "geo_algorithm.h"
#include "haversine.h"

static uint32_t sort_and_merge_aggregations(
    indent_t indent,
    geo_clustered_point_t *sorted_by_latitude,
    uint32_t num_input_points,
    float max_diameter_km);

static float diff(float val, float other);

static int compare_points(geo_point_t *point, geo_point_t *other);

static uint32_t compact_sorted_by_latitude(
    indent_t indent,
    geo_clustered_point_t *const sorted_by_latitude,
    uint32_t num_sorted_by_latitude_points);

static void compute_mid_point(
        indent_t indent,
        geo_merged_point_t *const dst,
        const geo_clustered_point_t *const from,
        const geo_clustered_point_t *const to);

static const uint32_t NO_COUNT = 0xFFFFFFFF;

uint32_t merge_aggregations_fast(
    indent_t indent,
    const geo_input_point_t *const input_points,
    uint32_t num_input_points,

    float max_diameter_km,
   
    /* Holds at least space for num_input_points */ 
    geo_merged_point_t *const sorted_by_latitude
) {

    enter(indent, "num_input_points=%d, max_diameter_km=%f", num_input_points, max_diameter_km);

    size_t size = BYTES(input_points, num_input_points);

    memcpy(sorted_by_latitude, input_points, size);

    boolean done = FALSE;

    uint32_t num_sorted_by_latitude_points = num_input_points;

    while (!done) {

        const uint32_t num_merged = sort_and_merge_aggregations(
            indent + 1,
            sorted_by_latitude,
            num_sorted_by_latitude_points,
	    max_diameter_km);

        if (num_merged == 0) {
            done = TRUE;
        }
        else {
            // Must compact the sorted_by_latitude
            const uint32_t after_compaction = compact_sorted_by_latitude(indent + 1, sorted_by_latitude, num_sorted_by_latitude_points);

            debug(indent, "compacted from %d to %d", num_sorted_by_latitude_points, after_compaction);

            assert(after_compaction <= num_sorted_by_latitude_points);
            assert(num_merged == num_sorted_by_latitude_points - after_compaction);

            num_sorted_by_latitude_points = after_compaction;
        }
    }

    exit(indent, "result=%d", num_sorted_by_latitude_points);

    return num_sorted_by_latitude_points;
}

static uint32_t compact_sorted_by_latitude(
    indent_t indent,
    geo_clustered_point_t *const sorted_by_latitude,
    uint32_t num_sorted_by_latitude_points) {

    enter(indent, "num=%d", num_sorted_by_latitude_points);

    int32_t dst_idx = -1;

    for (uint32_t i = 0; i < num_sorted_by_latitude_points; ++ i) {

        const geo_clustered_point_t *const point = &sorted_by_latitude[i];

        if (point->count ==  NO_COUNT) {

            if (dst_idx == -1) {
                trace(indent, "found entry to compact at %d", i);
                dst_idx = i;
            }
            else {
                // do not increase dst_idx as we will be writing to this slot
            }
        }
        else {
            // There is a free spot we can compact to
            if (dst_idx != -1) {

                trace(indent, "moving from %d to %d", i, dst_idx);

                // Is this a point that needs to be compacted?
                if (sorted_by_latitude[i].count != NO_COUNT) {

                    sorted_by_latitude[dst_idx] = sorted_by_latitude[i];

                    // For validation in next iteration
                    sorted_by_latitude[i].count = NO_COUNT;

                    // Move to next point where we write to
                    ++ dst_idx;
                }

                // Next area should have been moved up already so there is free space
                // to overwrite
                assert(sorted_by_latitude[dst_idx].count == NO_COUNT);
            }
        }
    }
    
    const uint32_t after_compaction = dst_idx == -1 ? num_sorted_by_latitude_points : dst_idx;

    exit(indent, "result=%d", after_compaction);

    return after_compaction;
}

static uint32_t sort_and_merge_aggregations(
    indent_t indent,
    geo_clustered_point_t *sorted_by_latitude,
    uint32_t num_input_points,
    float max_diameter_km) {

    enter(indent, "num_input_points=%d", num_input_points);

    size_t one_point_bytes = BYTES(sorted_by_latitude, 1);

    // Sort all points in the sorted_by_latitude by latitude
    qsort(sorted_by_latitude, num_input_points, one_point_bytes, (void *)&compare_points);

    const float max_degrees_latitude = max_diameter_km / 100.0;
    
    uint32_t num_merged = 0;

    for (uint32_t i = 0; i < num_input_points - 1; ++ i) {

        geo_input_point_t *const point = &sorted_by_latitude[i];

        if (point->count == NO_COUNT) {
            trace(indent, "skipping already merged outer point at %d", i);
            continue;
        }

        const float latitude = point->geo_point.latitude;
        const float latitude_plus_90 = latitude + 90.0;

        const float longitude = point->geo_point.longitude;
        const float longitude_plus_180 = longitude + 180;

        const float one_longitude_degree_km = haversine(
            point->geo_point.latitude, 0,
            point->geo_point.latitude, 1,
            KILOMETERS);

        trace(indent, "at index %d computing one longitude degree km from latitude %f: %f",
            i,
            point->geo_point.latitude,
            one_longitude_degree_km);

        for (uint32_t j = i + 1; j < num_input_points; ++ j) {

            geo_clustered_point_t *const other = &sorted_by_latitude[j];

            if (other->count == NO_COUNT) {
                // Point already merged with some other point
                trace(indent, "skipping already merged inner point at %d", j);
                continue;
            }

            const float other_latitude_plus_90 = other->geo_point.latitude + 90.0;
            const float latitude_diff = diff(latitude_plus_90, other_latitude_plus_90);

            // Exit whenever greater latitude diff than max diameter
            if (latitude_diff > max_degrees_latitude) {
                break;
            }

            if (point->geo_point.latitude < other->geo_point.latitude) {    
                fprintf(stderr, "Expected sorted %f %f at %d/%d\n", point->geo_point.latitude, other->geo_point.latitude, i, j);
            }

            const float other_longitude = other->geo_point.longitude;
            const float other_longitude_plus_180 = other_longitude + 180.0;

            const float longitude_diff = diff(longitude_plus_180, other_longitude_plus_180);

            const float longitude_diff_km = longitude_diff * one_longitude_degree_km;

            if (longitude_diff_km < max_diameter_km) {
                // Possible match, must compute distance

                const float distance = haversine(
                    point->geo_point.latitude,
                    point->geo_point.longitude,
                    other->geo_point.latitude,
                    other->geo_point.longitude,
                    KILOMETERS
                );

                if (distance < max_diameter_km) {

                    // Found a match for point
                    geo_merged_point_t merged_point;

                    compute_mid_point(
                        indent + 1,
                        &merged_point,
                        point,
                        other);

                    // Overwrite input point in place
                    *point = merged_point;

                    // Mark merged point as processed
                    trace(indent, "mark at index %d as merged, mid point set to index %d", j, i);

                    other->count = NO_COUNT;

                    ++ num_merged;
                    break;
                }
            }
        }
    }

    exit(indent, "result=%d", num_merged);

    return num_merged;
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

    assert(from->count != NO_COUNT);
    assert(to->count != NO_COUNT);

    trace_enter(indent, "from=(%f, %f) count %d, to=(%f, %f) count %d",
            from->geo_point.latitude,
            from->geo_point.longitude,
            from->count,
            to->geo_point.latitude,
            to->geo_point.longitude,
            to->count);

    trace(indent, "set sum count %d from %d and %d",
                sum_count,
                from->count,
                to->count);

    dst->count = sum_count;
    dst->geo_point.latitude = computed_latitude;
    dst->geo_point.longitude = computed_longitude;

    trace_exit(indent, "dst=(%f, %f) count=%d",
        dst->geo_point.latitude,
        dst->geo_point.longitude,
        dst->count);
}
