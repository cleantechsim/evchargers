#ifndef TYPES_H
#define TYPES_H

typedef int boolean;
typedef int int32_t;
typedef unsigned int uint32_t;


#define TRUE 1
#define FALSE 0

#define UB(x) ((unsigned char *)(x))

#define BYTES(var, num) (UB(&(var)[num]) - UB(&(var)[0]))

#endif


