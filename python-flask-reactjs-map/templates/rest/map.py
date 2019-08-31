
from flask import Blueprint, jsonify, request

from geo_types import GeoSwNe
from geo_hash import GeoHash
from geo_elasticsearch import GeoElasticSearch
from geo_clustering import GeoClustering

import sys

import json

from utils import enter, exit, debug

rest_map_blueprint = Blueprint('rest_map', __name__)


@rest_map_blueprint.route('/rest/map', methods=['GET'])
def get_map():

    indent = 0

    swLatitude = float(request.args['swLatitude'])
    swLongitude = float(request.args['swLongitude'])
    neLatitude = float(request.args['neLatitude'])
    neLongitude = float(request.args['neLongitude'])
    markerDiameterKM = float(request.args['markerDiameterKM'])

    '''
    print('get_map(swLatitude=' + str(swLatitude) + ', swLongitude=' + str(swLongitude) +
          ', neLatitude=' + str(neLatitude) + ', neLongitude=' + str(neLongitude) +
          ', markerDiameterKM=' + str(markerDiameterKM) + ')')
    '''

    geo_sw_ne = GeoSwNe(swLatitude, swLongitude, neLatitude,
                        neLongitude)

    result = get_map_params(indent + 1, geo_sw_ne, markerDiameterKM)

    exit(indent, 'get_map', '')

    return result


def get_map_params(indent, geo_sw_ne, markerDiameterKM):

    enter(indent, 'get_map_params', '')

    es_host = "localhost"
    es_port = 9200

    print('3# argv ' + json.dumps(sys.argv))
    if len(sys.argv) > 2:
        es_host = sys.argv[2]

    if len(sys.argv) > 3:
        es_port = int(sys.argv[3])

    es = GeoElasticSearch(es_host, es_port)

    # Aggregate all points
    geo_clustering = GeoClustering(es)

    points = geo_clustering.compute_clusters(
        indent + 1,
        markerDiameterKM,
        geo_sw_ne)

    debug(indent, 'get_map_params', 'after clustering call')

    result = []

    if points == None:
        debug(indent, 'get_map_params', 'no results for bounds')
    else:
        debug(indent, 'get_map_params', 'found ' + str(len(points)) + ' points')

        for point in points:

            geo_point = point.get_point()

            item = {
                "latitude": geo_point.latitude,
                "longitude": geo_point.longitude,
                "count": point.count
            }

            result.append(item)

    exit(indent, 'get_map_params', str(len(result)))

    return jsonify(result)


if __name__ == '__main__':
    get_map_params(
        0,
        GeoSwNe(swLatitude=-5.96575367107,
                swLongitude=-60.46875,
                neLatitude=77.4660284769,
                neLongitude=60.0),
        markerDiameterKM=726.277934253574)
