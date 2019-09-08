SRC := $(shell ls *.c | grep -v _test.c)
HEADERS := $(shell ls *.h)

TEST := $(shell ls *_test.c)

EXE := ./test

SHARED_NAME := geo_clustering.so
SHARED := ./$(SHARED_NAME)

INCLUDES := -I/usr/include/python2.7
LIBDIRS := -L/usr/lib/python2.7/config-x86_64-linux-gnu

$(EXE): $(SRC) $(HEADERS)
	gcc -Wall -g $(INCLUDES) $(LIBDIRS) -o $@ $(SRC) -lm -lpython2.7

$(SHARED): $(EXE)
	gcc -Wall -fPIC -shared -g $(INCLUDES) $(LIBDIRS) -o $@ $(SRC) -lm -lpython2.7
    
all: $(EXE) $(SHARED)

clean:
	rm -f $(OBJS) $(EXE) $(SHARED)

