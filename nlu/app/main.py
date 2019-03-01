
import json
import os

import numpy as np
import requests
import tensorflow as tf
from flask import Flask, jsonify
from keras.models import load_model
from keras.preprocessing.sequence import pad_sequences

global graph, model
graph = tf.get_default_graph()

max_utterance_length = 60
word2idx = {'infusion': 0, 'cold': 165, 'anything': 1, 'be': 2, 'coffee': 3, 'water': 4, 'green': 5, 'shot': 7, 'medium': 8, 'forget': 9, 'swap': 10, 'grande': 12, 'give': 13, "we're": 14, 'macchiato': 15, 'shaken': 16, 'me': 17, 'is': 83, 'soy': 172, "she'd": 19, 'item': 21, 'should': 85, "they'd": 22, "they'll": 25, 'roast': 24, 'syrup': 28, 'good': 86, 'fat': 27, 'tea': 29, 'first': 30, 'little': 31, 'whole': 43, 'vanilla': 32, 'mocha': 33, 'light': 35, 'really': 201, 'he': 36, 'switch': 126, 'much': 37, 'set': 38, 'that': 39, 'very': 40, 'moment': 41, 'nitro': 42, 'single': 134, 'on': 44, 'eleven': 88, 'her': 45, 'every': 46, 'non': 47, 'thirteen': 48, 'dragonfruit': 49, 'iced': 50, 'the': 51, 'spice': 52, 'not': 53, 'pike': 54, 'large': 55, 'off': 56, 'of': 57, 'venti': 210, 'second': 59, 'a': 60, 'bye': 61, "everyone's": 62, 'ready': 216, 'passion': 171, 'time': 138, 'caffe': 209, 'none': 63, 'him': 64, 'bit': 65, "they're": 67, 'it': 68, "he'd": 176, "everbody's": 69, 'leave': 70, 'no': 93, "we'd": 71, 'lose': 72, 'need': 73, 'substitute': 75, 'classic': 76, 'hook': 78, 'drink': 79, 'finished': 80, 'drop': 81, 'creamer': 82, 'hold': 87, 'acai': 84, 'caramel': 95, 'heavy': 89, 'frappuccino': 96, 'thank': 90, 'lemon': 91, 'third': 92, 'five': 94, 'have': 142, 'small': 97, 'four': 11, 'they': 98, 'us': 100, 'your': 102, 'ten': 99, 'hot': 104, 'so': 108, 'bunch': 109, 'doppio': 112, 'solo': 111, 'fifth': 114, 'would': 115, 'black': 117, "we'll": 118, 'whip': 119, 'everything': 101, "she's": 122, 'eight': 121, 'she': 123, 'place': 124, 'minute': 125, 'tall': 146, 'lemonade': 128, 'flat': 103, 'replace': 129, 'help': 182, 'lime': 130, "that's": 131, 'I': 132, 'seven': 18, 'salted': 133, 'could': 135, 'any': 136, 'make': 107, 'milk': 137, 'cappuccino': 58, 'those': 139, 'white': 148, 'tango': 140, 'an': 141, 'sparkling': 143, 'brew': 144, 'percent': 20, 'can': 145, 'cascara': 147, 'hang': 149, 'dubble': 150, 'coconut': 110, 'for': 151, 'am': 153, 'equal': 154, 'want': 155, 'pina': 113, 'ENDPAD': 233, 'from': 156, 'fourth': 157, 'two': 158, 'done': 159, 'are': 160, 'sweet': 161, 'colada': 162, "everything's": 152, 'take': 164, 'in': 166, 'UNKNOWN': 234, 'and': 167, 'espresso': 168, 'i': 169, "she'll": 170, "i'm": 173, 'to': 23, "that'll": 174, 'short': 175, 'you': 26, 'lots': 177, "he'll": 77, 'thing': 178, 'latte': 179, "i'd": 116, 'sugar': 180, 'hibiscus': 181, 'okay': 191, 'add': 183, "he's": 184, 'sans': 185, 'strawberry': 105, "i'll": 186, 'thanks': 187, 'lot': 188, 'fine': 189, 'order': 190, 'pumpkin': 120, 'may': 66, 'without': 192, 'fog': 193, 'everyone': 194, 'chocolate': 195, 'splenda': 196, 'change': 197, 'blonde': 198, 'pineapple': 199, 'like': 200, 'last': 34, 'get': 202, 'lieu': 203, 'pink': 204, 'mango': 205, 'twelve': 206, 'more': 207, 'with': 208, 'everbody': 211, 'up': 212, 'will': 213, 'appreciate': 127, 'berry': 214, 'cancel': 215, 'extra': 217, 'six': 218, 'wait': 219, 'one': 163, 'nine': 220, 'cream': 221, 'actually': 74, 'just': 222, 'we': 223, 'remove': 224, 'too': 225, 'teavana': 226, 'them': 227, 'three': 228, 'americano': 229, 'foam': 232, 'all': 230, 'skip': 106, 'do': 231, 'instead': 6}
tag2idx = {'I-END_OF_ORDER': 22, 'I-NEED_MORE_TIME': 23, 'B-TARGET': 24, 'B-PREPOSITION_TARGET_FORWARD': 36, 'B-POSITION': 0, 'I-SYRUP_AMT': 1, 'I-PRONOUN_ALL': 26, 'I-FLAVOR': 37, 'B-MILK': 27, 'B-PRONOUN_ALL': 28, 'B-ITEM': 8, 'B-WITH': 3, 'B-QUANTITY': 29, 'B-PREPOSITION_QUANTITY': 30, 'B-INSTEAD_OF': 39, 'B-PREPOSITION_TARGET_BACK': 31, 'B-REMOVE': 4, 'I-SIZE': 34, 'B-FOR': 6, 'I-SHOT': 7, 'I-ITEM': 38, 'O': 41, 'B-SIZE': 33, 'B-NEED_MORE_TIME': 32, 'I-POSITION': 9, 'B-SYRUP_AMT': 14, 'I-ADD': 11, 'B-SUBSTITUTE_WITH_TARGET': 13, 'I-SUBSTITUTE_WITH_TARGET': 2, 'B-FLAVOR': 15, 'B-ADD': 16, 'B-SYRUP': 17, 'B-SHOT': 18, 'B-END_OF_ORDER': 21, 'I-REMOVE': 35, 'I-MILK': 19, 'B-CONJUNCTION': 10, 'B-THE': 20, 'I-INSTEAD_OF': 5, 'I-TARGET': 12, 'I-SYRUP': 25, 'B-PRONOUN': 40}
groups2idx = {'B-ADD': 4, 'B-REMOVE': 6, 'B-SUBSTITUTE': 3, 'I-ADD': 0, 'I-REMOVE': 5, 'I-SUBSTITUTE': 2, 'None': 1, 'O': 7}
app = Flask(__name__)

MODEL_URL = os.environ['MODEL_URL']
model = load_model('model.h5')

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
        return words, tokens, groups

@app.route('/')
def hello_world():
    words, tokens, groups = predict(model, 'i want coffee instead of lemonade', max_utterance_length, word2idx, tag2idx, groups2idx)
    result = {
        'words': words,
        'tokens': tokens,
        'groups': groups
    }
    return jsonify(result)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=8080)
