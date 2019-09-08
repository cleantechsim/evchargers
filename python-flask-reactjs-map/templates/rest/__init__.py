
from map import rest_map_blueprint
from map import init_es

from geo_elasticsearch import GeoElasticSearch

import sys


def init_app(app):
    app.register_blueprint(rest_map_blueprint)

    es_host = "localhost"
    es_port = 9200
    es_index = GeoElasticSearch.GEO_POINTS
    es_field = "location"

    if len(sys.argv) > 2:
        es_host = sys.argv[2]

    if len(sys.argv) > 3:
        es_port = int(sys.argv[3])

    if len(sys.argv) > 4:
        es_index = sys.argv[4]

    if len(sys.argv) > 5:
        es_field = sys.argv[5]

    es = GeoElasticSearch(es_host, es_port, es_index, es_field)

    init_es(es)
