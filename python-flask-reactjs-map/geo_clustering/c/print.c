#include "print.h"

void print_clustered_points(indent_t indent, const geo_clustered_point_t *const points, uint32_t num_points) {

    for (uint32_t i = 0; i < num_points; ++ i) {
        const geo_clustered_point_t *const point = &points[i];

        debug(indent, "point %d is (%f, %f)", i, point->geo_point.latitude, point->geo_point.longitude);
    }
}

