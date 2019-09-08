SRC := $(shell ls *.c | grep -v _test.c)
HEADERS := $(shell ls *.h)

TEST := $(shell ls *_test.c)

EXE=./test

$(EXE): $(SRC) $(HEADERS)
	gcc -Wall -g -o $@ $(SRC) -lm

all: $(EXE)

clean:
	rm -f $(OBJS) $(EXE)

