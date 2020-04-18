
#ifndef GEO_ALGORITHM_H
#define GEO_ALGORITHM_H

#include "types.h"
#include "debug.h"
#include "geo_clustering_types.h"

uint32_t merge_aggregations_fast(
    indent_t indent,
    const geo_input_point_t *const input_points,
    uint32_t num_input_points,

    float max_diameter_km,
   
    /* Holds at least space for num_input_points */ 
    geo_merged_point_t *const out_points);

#endif

