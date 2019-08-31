
from flask import Flask

from geo_point_gen import GeoPointGen
from geo_elasticsearch import GeoElasticSearch
from templates import app
from geo_types import GeoSwNe

from geo_clustering import GeoClustering
import sys

from haversine import haversine

es = GeoElasticSearch('localhost', 9200)

if len(sys.argv) <= 1:
    raise Exception('Expected args')

cmd = sys.argv[1]

if cmd == "generate":

    if len(sys.argv) > 1:
        count = int(sys.argv[2])
    else:
        count = 10000

    geo_points = GeoPointGen.generate(count)
    es.upload_points(geo_points)

elif cmd == "test":

    clustering = GeoClustering(es)

    clustering.compute_clusters(
        0,
        int(sys.argv[2]),
        GeoSwNe(-90, -180, 90, 180))

elif cmd == "webapp":
    if __name__ == '__main__':
        app.run()

else:
    raise 'Unknown command'
