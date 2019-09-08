FROM ubuntu:18.04 AS build-env

RUN apt-get update

RUN apt-get install -y make
RUN apt-get install -y g++
RUN apt-get install -y python-dev

COPY . /compile

WORKDIR /compile/geo_clustering/c

RUN make all



# FROM python:2.7

FROM ubuntu:18.04

RUN apt-get update

RUN apt-get install -y valgrind
RUN apt-get install -y python-pip

WORKDIR /app

COPY --from=build-env /compile/*.py /app/
COPY --from=build-env /compile/requirements.txt /app
COPY --from=build-env /compile/templates /app/templates
COPY --from=build-env /compile/geo_clustering/*.py /app/geo_clustering/
COPY --from=build-env /compile/geo_clustering/c/geo_clustering_c.so /app/geo_clustering/c/
COPY --from=build-env /compile/geo_clustering/c/__init__.py /app/geo_clustering/c
COPY --from=build-env /compile/geo_clustering/c/merged_point.py /app/geo_clustering/c

RUN pip install -r requirements.txt

CMD ["python", "run.py", "webapp", "es", "9200", "evchargers"]

