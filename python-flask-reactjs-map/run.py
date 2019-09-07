
from flask import Flask

from geo_point_gen import GeoPointGen
from geo_elasticsearch import GeoElasticSearch
from templates import app
from geo_types import GeoSwNe

from geo_clustering.geo_clustering import GeoClustering
import sys

from haversine import haversine


if len(sys.argv) <= 1:
    raise Exception('Expected args')

cmd = sys.argv[1]

if cmd == "generate":
    es = GeoElasticSearch(
        'localhost', 9200, GeoElasticSearch.GEO_POINTS, 'location')

    if len(sys.argv) > 1:
        count = int(sys.argv[2])
    else:
        count = 10000

    geo_points = GeoPointGen.generate_with_world_bounds(count)
    es.upload_points(geo_points)

elif cmd == "test":
    es = GeoElasticSearch(
        'localhost', 9200, GeoElasticSearch.GEO_POINTS, 'location')

    clustering = GeoClustering(es)

    clustering.compute_clusters(
        0,
        int(sys.argv[2]),
        GeoSwNe(-90, -180, 90, 180))

elif cmd == "webapp":
    if __name__ == '__main__':
        app.run('0.0.0.0', 5000)

else:
    raise 'Unknown command'
