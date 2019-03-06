# settings.py
import json
import logging
import os
from functools import wraps
from os import getenv

import requests
from dotenv import load_dotenv
from flair.data import Sentence
from flair.models import SequenceTagger
from flask import Flask, Response, abort, jsonify, request
from flask_caching import Cache

load_dotenv()
app = Flask(__name__)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formater = logging.Formatter('%(asctime)s - %(message)s')
handler.setFormatter(formater)
logger.addHandler(handler)

TOKEN_MODEL_URL = str(getenv('TOKEN_MODEL_URL', ''))
GROUP_MODEL_URL = str(getenv('GROUP_MODEL_URL', ''))

token_model = download_and_load_models(TOKEN_MODEL_URL, 'token-model.pt')
group_model = download_and_load_models(GROUP_MODEL_URL, 'group-model.pt')


def download_and_load_models(url: str, file_name:str) -> SequenceTagger:
    r = requests.get(url)
    with open(file_name, 'wb') as f:  
        f.write(r.content)
    return SequenceTagger.load_from_file(file_name)


def check_auth(auth_header_value):
    """This function is checks the auth key.
    """
    return 'Bearer ' + \
        os.getenv("MENU_SERVICE_PAYLOAD_ENDPOINT_KEY") == auth_header_value


def not_authorized():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'Authorization': 'Bearer api-key'})


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('authorization')
        if not auth or not check_auth(auth):
            return not_authorized()
        return f(*args, **kwargs)
    return decorated


# @app.route('/nlu', methods=['POST'])
# @requires_auth
# def analyzeSentiment():
#     if not request.json or not 'message' in request.json:
#         abort(400)
#     message = request.json['message']
#     sentence = Sentence(message)
#     classifier.predict(sentence)
#     print('Sentence sentiment: ', sentence.labels)
#     label = sentence.labels[0]
#     response = {'result': label.value, 'polarity':label.score}
#     return jsonify(response), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=80)
