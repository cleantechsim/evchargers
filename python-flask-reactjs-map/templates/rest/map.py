
from flask import Blueprint, jsonify, request

from geo_types import GeoSwNe
from geo_hash import GeoHash
from geo_clustering.geo_clustering import GeoClustering

from geo_elasticsearch import GeoElasticSearch
from geo_hash_precision_finder import GeoHashPrecisionFinder

from utils import enter, exit, debug
from range import Range

import sys

import json

import requests


rest_map_blueprint = Blueprint('rest_map', __name__)

es = None

def init_es(elasticsearch):
    global es
    es = elasticsearch

@rest_map_blueprint.route('/rest/search', methods=['GET'])
def search():

    place = request.args['place']

    return es.search(place)

@rest_map_blueprint.route('/rest/map', methods=['GET'])
def get_map():

    indent = 0

    swLatitude = float(request.args['swLatitude'])
    swLongitude = float(request.args['swLongitude'])
    neLatitude = float(request.args['neLatitude'])
    neLongitude = float(request.args['neLongitude'])
    markerDiameterKM = float(request.args['markerDiameterKM'])

    if request.args.has_key('operators'):
        operators = request.args['operators'].split(",")
    else:
        operators = []

    if request.args.has_key('minKw'):
        min_kw = float(request.args['minKw'])
    else:
        min_kw = -1
    if request.args.has_key('maxKw'):

        max_kw = float(request.args['maxKw'])
    else:
        max_kw = -1

    if min_kw >= 0 and max_kw >= 0:
        kw_range = Range(min_kw, max_kw)
    else:
        kw_range = None

    if request.args.has_key('connectionTypes'):
        connection_types = request.args['connectionTypes'].split(",")
    else:
        connection_types = []

    '''
    print('get_map(swLatitude=' + str(swLatitude) + ', swLongitude=' + str(swLongitude) +
          ', neLatitude=' + str(neLatitude) + ', neLongitude=' + str(neLongitude) +
          ', markerDiameterKM=' + str(markerDiameterKM) + ')')
    '''

    geo_sw_ne = GeoSwNe(swLatitude, swLongitude, neLatitude,
                        neLongitude)

    result = get_map_params(indent + 1, geo_sw_ne, markerDiameterKM, operators, kw_range, connection_types)

    exit(indent, 'get_map', '')

    return result

def get_map_params(indent, geo_sw_ne, marker_diameter_km, operators, kw_range, connection_types):

    enter(indent, 'get_map_params', '')

    geo_bounds = geo_sw_ne.to_geo_bounds()

    cur_geohash_precision = GeoHashPrecisionFinder.find_geohash_bits_from_width_geo_bounds_kms(
        geo_bounds
    )

    debug(indent, 'get_map_params', 'got precision ' + str(cur_geohash_precision) +
            ' for ' + str(geo_bounds.width))

    es_result = es.aggregate_search_with_filter(cur_geohash_precision, geo_bounds, operators, kw_range, connection_types)

    # Aggregate all points
    geo_clustering = GeoClustering()

    points = geo_clustering.compute_clusters(
        indent + 1,
        geo_sw_ne,
        marker_diameter_km,
        es_result.geo_hash_to_count)

    debug(indent, 'get_map_params', 'after clustering call')

    result_points = []

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

            result_points.append(item)

    result = {
        "points": result_points,
        "operators": es_result.operator_to_count,
        "kw_min_max": {
            "min": es_result.kw_min_max.min,
            "max": es_result.kw_min_max.max
        },
        "connection_types": es_result.connection_type_to_count
    }

    exit(indent, 'get_map_params', str(len(result_points)))

    return jsonify(result)

@rest_map_blueprint.route('/rest/reference_data', methods=['GET'])
def get_reference_data():

    url = 'https://api.openchargemap.io/v3/referencedata/'

    response = requests.get(url)

    return response.content

if __name__ == '__main__':
    get_map_params(
        0,
        GeoSwNe(swLatitude=-5.96575367107,
                swLongitude=-60.46875,
                neLatitude=77.4660284769,
                neLongitude=60.0),
        markerDiameterKM=726.277934253574)
