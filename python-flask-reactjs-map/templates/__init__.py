from templates import index
from templates import rest
from flask import Flask

app = Flask(__name__, static_folder='./public', template_folder='./static')


index.init_app(app)
rest.init_app(app)


@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r
