####################################
# compile

FROM ubuntu:19.10 AS build-env

RUN apt-get update

RUN apt-get install -y make
RUN apt-get install -y g++
RUN apt-get install -y python-dev
RUN apt-get update
RUN apt-get install -y npm

# Build C python module
COPY ./geo_clustering /compile/geo_clustering

WORKDIR /compile/geo_clustering/c

RUN make all

# Build react app
RUN mkdir -p /compile/templates/static

COPY ./templates/static/ts /compile/templates/static
COPY ./templates/static/tsconfig.json /compile/templates/static
COPY ./templates/static/webpack.config.js /compile/templates/static
COPY ./templates/static/package.json /compile/templates/static

WORKDIR /compile/templates/static
RUN npm install

COPY ./templates/static/js /compile/templates/static/js
COPY ./templates/static/ts /compile/templates/static/ts

RUN ./node_modules/.bin/webpack --mode=production


####################################
# build runtime image from compiled

FROM ubuntu:19.10

RUN apt-get update

RUN apt-get install -y valgrind
RUN apt-get install -y python-pip

WORKDIR /app

COPY ./*.py /app/
COPY ./requirements.txt /app

RUN mkdir /app/templates
COPY ./templates/__init__.py /app/templates

RUN mkdir /app/templates/index
COPY ./templates/index/__init__.py /app/templates/index
COPY ./templates/index/views.py /app/templates/index

RUN mkdir /app/templates/rest
COPY ./templates/rest/__init__.py /app/templates/rest
COPY ./templates/rest/map.py /app/templates/rest

RUN mkdir /app/templates/static
COPY ./templates/static/index.html /app/templates/static

RUN mkdir /app/templates/public
COPY ./templates/public/css /app/templates/public/css
COPY ./templates/public/js /app/templates/public/js

COPY --from=build-env /compile/templates/public/bundle.js /app/templates/public

COPY --from=build-env /compile/geo_clustering/c/geo_clustering_c.so /app/geo_clustering/c/

COPY ./geo_clustering/*.py /app/geo_clustering/
COPY ./geo_clustering/c/__init__.py /app/geo_clustering/c
COPY ./geo_clustering/c/merged_point.py /app/geo_clustering/c

RUN pip install -r requirements.txt

# CMD ["python", "run.py", "webapp", "es", "9200", "evchargers"]
# CMD ["valgrind", "python", "run.py", "webapp", "cleantechsim.northeurope.cloudapp.azure.com", "9200", "evchargers"]
CMD ["python", "run.py", "webapp", "cleantechsim.northeurope.cloudapp.azure.com", "9200", "evchargers"]

