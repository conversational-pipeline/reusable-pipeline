
import os

import numpy as np
from flask import Flask, jsonify

from flair_model import predict
from clean_text import clean_text

app = Flask(__name__)

@app.route('/<utterance>')
def predict_route(utterance):
    utterance = clean_text(utterance)
    prediction = predict(utterance)
    prediction['utterance'] = utterance
    return jsonify(prediction)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=8080)
