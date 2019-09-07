#ifndef GEO_TYPES_H
#define GEO_TYPES_H

typedef struct {
    float latitude;
    float longitude;
} geo_point_t;

typedef struct {
    geo_point_t *points;
    unsigned int count;
} geo_point_array_t;

typedef struct {
    float distance;

    const geo_point_t *from_point;
    const geo_point_t *to_point;
} geo_distance_t;

#endif


