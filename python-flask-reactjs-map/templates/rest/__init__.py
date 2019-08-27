
from map import rest_map_blueprint


def init_app(app):
    app.register_blueprint(rest_map_blueprint)
