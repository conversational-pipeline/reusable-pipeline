
# kaggle competition: https://www.kaggle.com/starbucks/starbucks-menu
import json
import os
import pickle

import numpy as np
import requests
import tensorflow as tf
from flask import Flask, jsonify
from keras.models import load_model
from keras.preprocessing.sequence import pad_sequences

graph = tf.get_default_graph()

max_utterance_length = 60
app = Flask(__name__)

def get_pickles(pickle_file):
    r = requests.get(os.environ['PICKLED_IDXS'])
    with open(pickle_file, 'wb') as f:
        f.write(r.content)

    with open(pickle_file, 'rb') as f:
        idxs = pickle.load(f)
    return idxs

pickle_file = 'pickled_idxs'
idxs = get_pickles(pickle_file)

word2idx = idxs['word2idx']
tag2idx = idxs['tag2idx']
groups2idx = idxs['groups2idx']

def get_model(model_name):
    r = requests.get(os.environ['MODEL_URL'])
    with open(model_name, 'wb') as f:
        f.write(r.content)
    model = load_model(model_name)
    return model

model = get_model('model.h5')


def transform_utterances_for_keras(utterances, max_utterance_length, word2idx):
    X = [[(word2idx.get(word) or word2idx.get("UNKNOWN")) for word in phrase] for phrase in utterances]
    X = pad_sequences(maxlen=max_utterance_length, sequences=X, padding="post", value=word2idx['ENDPAD'])
    return X

def predict(model, pred_utterance, max_utterance_length, word2idx, tag2idx, groups2idx):
    with graph.as_default():
        pred_utterances = [pred_utterance.split()]
        X = transform_utterances_for_keras(pred_utterances, max_utterance_length, word2idx)    
        token_test_pred, group_test_pred = model.predict(np.array([X[0]]))
        token_test_pred = np.argmax(token_test_pred, axis=-1)
        group_test_pred = np.argmax(group_test_pred, axis=-1)

        idx2word = {idx: word for word, idx in word2idx.items()}
        idx2tag = {idx: word for word, idx in tag2idx.items()}
        idx2group = {idx: word for word, idx in groups2idx.items()}
        
        words = []
        tokens = []
        groups = []
        
        for w, token_pred, group_pred in zip(X[0], token_test_pred[0], group_test_pred[0]):
            if 'ENDPAD' not in idx2word[w]:
                words.append(idx2word[w])
                tokens.append(idx2tag[token_pred])
                groups.append(idx2group[group_pred])
        return reshape_prediction(words, tokens, groups)

def reshape_bio(words, tags):
    current_letter_index = 0
    ents = []
    for word, tag in zip(words, tags): 
        if tag[0] == 'I' and len(ents) > 0:
            ents[-1]['end'] += len(word) + 1
        else:
            ent = {'start': current_letter_index,
                   'end': current_letter_index + len(word) + 1,
                   'label': tag.split('-')[-1]}
            ents.append(ent)
        current_letter_index += len(word) + 1
    return {'items': ents}

def reshape_prediction(utterance, tokens, groups, suffix=''):
    token_visualizer = reshape_bio(utterance, tokens)
    group_visualizer = reshape_bio(utterance, groups)
    return {
        'tokens': token_visualizer,
        'groups': group_visualizer
    }

@app.route('/<utterance>')
def predict_route(utterance):
    prediction = predict(model, utterance, max_utterance_length, word2idx, tag2idx, groups2idx)
    prediction['utterance'] = utterance
    return jsonify(prediction)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=8080)
