from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
import pandas as pd
import numpy as np


app = Flask(__name__)
CORS(app)
mongo = PyMongo(app)


if __name__ == "__main__":
    app.run(port=5001, debug=True)