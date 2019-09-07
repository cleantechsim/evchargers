#ifndef GEO_CLUSTERING_TYPES_H
#define GEO_CLUSTERING_TYPES_H

#include "types.h"
#include "geo_types.h"

typedef struct {

    geo_point_t geo_point;

    uint32_t count; 

} geo_clustered_point_t;

typedef geo_distance_t geo_clustering_distance_t;


/* Input points are clustered by geohash */
typedef geo_clustered_point_t geo_input_point_t;

/* points that are merged by other points in clustering algorithm */
typedef geo_clustered_point_t geo_merged_point_t;

typedef struct {
    geo_clustered_point_t *points;
    unsigned int count;
} geo_point_array_t;


#endif



