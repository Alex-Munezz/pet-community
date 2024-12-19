from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from models import db
import os

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://mac:munezz456@localhost:5432/petcommunitydb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


CORS(app) 
db.init_app(app)

migrate = Migrate()
migrate.init_app(app, db)


@app.route('/')
def index():
    return "Pet Community Backend is running!"

