
from views import index_blueprint


def init_app(app):
    app.register_blueprint(index_blueprint)
