#include "print.h"

void print_scratch_clustered_points(indent_t indent, const geo_scratch_clustered_point_t *const points, uint32_t num_points) {
#if TRACE
    for (uint32_t i = 0; i < num_points; ++ i) {
        const geo_scratch_clustered_point_t *const point = &points[i];

        trace(indent, "point %d is (%f, %f) original index %d",
                i,
                point->base.geo_point.latitude,
                point->base.geo_point.longitude,
                point->original_index);
    }
#endif
}

