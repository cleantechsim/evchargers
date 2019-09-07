#ifndef GEO_CLUSTERING_H
#define GEO_CLUSTERING_H

#include "debug.h"
#include "scratchbuf.h"
#include "geo_clustering_types.h"

int32_t merge_aggregations(
    indent_t indent,

    const geo_input_point_t *const input_points,
    uint32_t num_input_points,

    float max_diameter_km,

    /* Holds at least space for num_input_points */
    scratch_buf_t *const out_points
);

#endif


