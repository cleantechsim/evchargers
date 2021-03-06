from flask import render_template, request, Blueprint

index_blueprint = Blueprint('index-blueprint', __name__)


@index_blueprint.route('/')
def index():

    proxied_uri = request.headers.get('X-Proxied-URI')

    if proxied_uri != None and proxied_uri.endswith('/'):
        prefix = proxied_uri[0:len(proxied_uri) - 1]
    else:
        prefix = ''

    return render_template("index.html", url_prefix=prefix)
