import requests
import os
from flair.data import Sentence
from flair.models import SequenceTagger

token_model = SequenceTagger.load_from_file('token-model.pt')
group_model = SequenceTagger.load_from_file('group-model.pt')

def _flair_to_visualizer(sentence, model, tag):
    flair_sentence = Sentence(sentence)
    model.predict(flair_sentence)
    words = [word.text for word in flair_sentence]
    tags = [word.get_tag(tag).value for word in flair_sentence]
    return words, tags

def _reshape_bio(words, tags):
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

def predict(pred_utterance):
    words, tokens = _flair_to_visualizer(pred_utterance, token_model, 'token')
    words, groups = _flair_to_visualizer(pred_utterance, group_model, 'group')
    print(words)
    print(tokens)
    print(groups)
    token_visualizer = _reshape_bio(words, tokens)
    group_visualizer = _reshape_bio(words, groups)
    return {
        'tokens': token_visualizer,
        'groups': group_visualizer
    }
