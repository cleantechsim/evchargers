#ifndef HAVERSINE_H
#define HAVERSINE_H

typedef enum {

    KILOMETERS

} unit_t;


float haversine(
    float latitude,
    float longitude,
    float other_latitude,
    float other_longitude,
    unit_t unit);

#endif



