import os
import pickle

import numpy as np
import requests
import tensorflow as tf
from keras.models import load_model
from keras.preprocessing.sequence import pad_sequences

graph = tf.get_default_graph()

def _get_pickles(pickle_file):
    with open(pickle_file, 'rb') as f:
        idxs = pickle.load(f)
    return idxs

MODEL_DEPENDENCIES = _get_pickles('pickled_idxs')

WORD2IDX = MODEL_DEPENDENCIES['word2idx']
TAG2IDX = MODEL_DEPENDENCIES['tag2idx']
GROUP2IDX = MODEL_DEPENDENCIES['groups2idx']
MAX_UTTERANCE_LEN = 60
BATCH_SIZE = 32

MODEL = load_model('model.h5')

def _transform_utterances_for_keras(utterances, max_utterance_length, word2idx):
    X = [[(word2idx.get(word) or word2idx.get("UNKNOWN")) for word in phrase] for phrase in utterances]
    X = pad_sequences(maxlen=max_utterance_length, sequences=X, padding="post", value=word2idx['ENDPAD'])
    return X

def predict(pred_utterance, is_elmo):
    with graph.as_default():
        pred_utterances = [pred_utterance.split()]
        X = _transform_utterances_for_keras(pred_utterances, MAX_UTTERANCE_LEN, WORD2IDX)    
        token_test_pred, group_test_pred = MODEL.predict(np.array([X[0]]))
        token_test_pred = np.argmax(token_test_pred, axis=-1)
        group_test_pred = np.argmax(group_test_pred, axis=-1)

        idx2word = {idx: word for word, idx in WORD2IDX.items()}
        idx2tag = {idx: word for word, idx in TAG2IDX.items()}
        idx2group = {idx: word for word, idx in GROUP2IDX.items()}
        
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
