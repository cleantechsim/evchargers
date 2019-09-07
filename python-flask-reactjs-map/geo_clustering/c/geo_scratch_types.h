
#ifndef GEO_SCRATCH_TYPES_H
#define GEO_SCRATCH_TYPES_H

#include "geo_clustering_types.h"

typedef struct {
    float distance;

    geo_clustered_point_t from_point;
    geo_clustered_point_t to_point;

    uint32_t from_point_index;
    uint32_t to_point_index;

} geo_scratch_distance_t;

typedef struct {
    geo_clustered_point_t *points;
    unsigned int count;
} geo_scratch_point_array_t;

#endif


