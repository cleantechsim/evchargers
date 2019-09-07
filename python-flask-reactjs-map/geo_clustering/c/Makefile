SRC := $(shell ls *.c)
HEADERS := $(shell ls *.h)

EXE=./test

$(EXE): $(SRC) $(HEADERS)
	gcc -Wall -g -o $@ $(SRC) -lm

all: $(EXE)

clean:
	rm -f $(OBJS) $(EXE)

