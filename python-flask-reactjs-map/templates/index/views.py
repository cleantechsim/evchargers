from flask import render_template, Blueprint

index_blueprint = Blueprint('index-blueprint', __name__)


@index_blueprint.route('/')
def index():
    return render_template("index.html")
